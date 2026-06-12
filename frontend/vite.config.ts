import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Pre-compress assets with Brotli (best compression)
    compression({ algorithm: 'brotliCompress', threshold: 1024 }),
    // Also generate Gzip versions for broader server support
    compression({ algorithm: 'gzip', threshold: 1024 }),
    // Bundle analyzer — generates stats.html in dist/
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  build: {
    minify: true,
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core — rarely changes
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react/')) {
            return 'vendor-react'
          }
          // Chart library — large, separate chunk
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'vendor-charts'
          }
          // Animation library
          if (id.includes('gsap')) {
            return 'vendor-gsap'
          }
          // Material Symbols font — separate chunk
          if (id.includes('material-symbols')) {
            return 'vendor-icons'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) return 'assets/css/[name]-[hash][extname]'
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(name)) return 'assets/images/[name]-[hash][extname]'
          if (/\.(woff2?|ttf|eot)$/.test(name)) return 'assets/fonts/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
