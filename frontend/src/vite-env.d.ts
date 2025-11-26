/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIDCHAIN_ADDRESS: string;
  readonly VITE_AIDTOKEN_ADDRESS: string;
  readonly VITE_DYNAMIC_ENV_ID: string;
  readonly VITE_IPFS_GATEWAY: string;
  readonly VITE_BACKEND_API: string;
  readonly VITE_SELF_PROTOCOL_API: string;
  readonly VITE_SELF_PROTOCOL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
