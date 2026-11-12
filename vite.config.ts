import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to prevent Rollup from emitting duplicate ONNX WASM binaries into dist/assets/
// All WASM binaries are served statically from /wasm/ directory.
function excludeBundledWasm(): Plugin {
  return {
    name: 'exclude-bundled-wasm',
    generateBundle(_options, bundle) {
      for (const fileName in bundle) {
        if (fileName.endsWith('.wasm')) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), excludeBundledWasm()],
  resolve: {
    alias: {
      sharp: false,
      'onnxruntime-node': false,
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers', 'onnxruntime-web'],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/konva') || id.includes('node_modules/react-konva')) {
            return 'konva';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
});
