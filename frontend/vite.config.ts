import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for debugging in production (optional)
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - these change less frequently
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-font-family', '@tiptap/extension-text-style', '@tiptap/extension-highlight'],
          'ui-vendor': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Increase chunk warning limit (optional)
    chunkSizeWarningLimit: 1000,
    // Minification - esbuild is bundled with Vite, no extra install needed
    minify: 'esbuild',
  },
  // Development server optimizations
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  // Preview server (for testing production build)
  preview: {
    port: 4173,
  },
})

