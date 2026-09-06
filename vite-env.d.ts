/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_API_URL?: string;
  readonly VITE_CONTENT_SOURCE?: 'api' | 'static';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
