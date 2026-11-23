import { defineConfig, loadEnv } from 'vite';

// Fills the __SITE_URL__ placeholder in index.html (social-share image URLs need to be absolute).
// Priority: SITE_URL (your custom domain) -> RENDER_EXTERNAL_URL (set automatically by Render) -> empty (relative URLs).
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const site = (env.SITE_URL || env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
  return {
    plugins: [{ name: 'nova-site-url', transformIndexHtml: html => html.replaceAll('__SITE_URL__', site) }],
    build: { target: 'es2020', chunkSizeWarningLimit: 700 }
  };
});
