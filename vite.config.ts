import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function patchViteClientWebSocket(): Plugin {
  return {
    name: 'patch-vite-client-websocket',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs')) {
        return code
          .replace('console.debug("[vite] connecting...");', '')
          .replace(
            'await wsTransport.connect(handlers);',
            'return;'
          )
          .replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '// HMR WebSocket connection disabled in preview environment'
          )
          .replace(
            'setupForwardConsoleHandler(transport, forwardConsole);',
            ''
          );
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), patchViteClientWebSocket()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: false as const,
      ws: false as const,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

