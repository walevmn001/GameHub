/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ backend (Render). Bỏ trống để chạy chế độ Local/Demo. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
