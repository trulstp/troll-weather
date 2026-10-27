import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SOURCES } from './src/sources.js'

/**
 * Starts the API requests from index.html, in parallel with downloading the app's
 * JavaScript, instead of after it has loaded and run. The tiny inline script only
 * adds a <link rel="preload"> when the cached copy is missing or stale, so repeat
 * visits don't download data they won't use. fetch() then reuses the preloaded response.
 */
function preloadData() {
  const sources = JSON.stringify(Object.values(SOURCES))
  const script = `(function(){var n=Date.now();${sources}.forEach(function(s){var c=null;try{c=JSON.parse(localStorage.getItem(s.key))}catch(e){}if(c&&n-c.savedAt<s.maxAge)return;var l=document.createElement('link');l.rel='preload';l.as='fetch';l.crossOrigin='anonymous';l.href=s.url;document.head.appendChild(l)})})()`
  return {
    name: 'preload-data',
    transformIndexHtml: () => [{ tag: 'script', children: script, injectTo: 'head-prepend' }],
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadData()],
  // Relative asset paths so the build works on GitHub Pages under any repo name.
  base: './',
})
