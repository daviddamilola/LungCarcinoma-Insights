import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
   optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/material/utils'
    ]
  },
  ssr: { noExternal: ['@mui/material', '@mui/icons-material', '@mui/material/utils', "@emotion/react",
      "@emotion/styled",] }
});
