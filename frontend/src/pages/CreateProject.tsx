import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { Upload, CheckCircle } from 'lucide-react';
import blockchainService from '../services/blockchain';
import ipfsService from '../services/ipfs';
import selfProtocolService from '../services/selfProtocol';
import toast from 'react-hot-toast';
import { ProjectFormData } from '../types';

interface DynamicUser {
  verifiedCredentials?: Array<{
    address: string;
  }>;
}

interface DynamicContext {
  user: DynamicUser | null;
}

interface TransactionLog {
  eventName?: string;
  args?: {
    projectId?: string | bigint;
  };
}

export default function CreateProject(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useDynamicContext() as DynamicContext;
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    fundingGoal: '',
    location: '',
    category: '',
  });
  const [zkKYCVerified, setZkKYCVerified] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleVerifyKYC = async (): Promise<void> => {
    try {
      setLoading(true);
      // In production, this would integrate with Self Protocol for real zkKYC
      const result = await selfProtocolService.mockVerification(user?.verifiedCredentials?.[0]?.address || '');
      
      if (result.success) {
        setZkKYCVerified(true);
        toast.success('zkKYC verification successful!');
      } else {
        toast.error('zkKYC verification failed');
      }
    } catch (error) {
      console.error('Error verifying KYC:', error);
      toast.error('Failed to verify KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!zkKYCVerified) {
      toast.error('Please complete zkKYC verification first');
      return;
    }

    try {
      setLoading(true);

      // Upload project data and files to IPFS
      const { metadataHash } = await ipfsService.uploadProjectData(formData, files);

      // Create project on blockchain
      const receipt = await blockchainService.createProject(
        formData.name,
        formData.description,
        metadataHash,
        formData.fundingGoal
      );

      // Get the project ID from the event
      const event = (receipt.logs as TransactionLog[]).find(log => log.eventName === 'ProjectCreated');
      const projectId = event?.args?.projectId;

      if (projectId) {
        // Verify zkKYC on-chain
        await blockchainService.verifyZKKYC(projectId.toString());
        
        toast.success('Project created successfully!');
        navigate(`/project/${projectId}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Create Humanitarian Project</h1>
        <p className="text-gray-400">
          Launch your verified humanitarian project with transparent, milestone-based funding
        </p>
      </div>

      {!zkKYCVerified && (
        <div className="mb-6 p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">zkKYC Verification Required</h3>
          <p className="text-gray-300 mb-4">
            To create a project, you must complete zkKYC verification through Self Protocol. This ensures
            transparency and builds trust with donors.
          </p>
          <button
            onClick={handleVerifyKYC}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify with Self Protocol'}
          </button>
        </div>
      )}

      {zkKYCVerified && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
          <span className="text-green-400">zkKYC Verified - You can now create a project</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Project Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            placeholder="e.g., Clean Water for Rural Villages"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={5}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            placeholder="Describe your humanitarian project in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Select category</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="water">Water & Sanitation</option>
              <option value="food">Food Security</option>
              <option value="shelter">Shelter</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="e.g., Kenya, East Africa"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Funding Goal (ETH)</label>
          <input
            type="number"
            name="fundingGoal"
            value={formData.fundingGoal}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0.01"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            placeholder="e.g., 10"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Supporting Documents & Images</label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-primary-500 hover:text-primary-400"
            >
              Click to upload files
            </label>
            <p className="text-gray-400 text-sm mt-2">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Upload images, documents, or videos'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !zkKYCVerified}
          className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Project...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
