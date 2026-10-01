import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'chanakya-probe-middleware',
        configureServer(server) {
          server.middlewares.use('/api/audit/probe', async (req, res) => {
            const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
            const targetUrl = parsedUrl.searchParams.get('targetUrl');

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing targetUrl parameter' }));
              return;
            }

            try {
              const parsed = new URL(targetUrl);
              const hostname = parsed.hostname.toLowerCase();
              if (
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.startsWith('10.') ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('172.16.') ||
                hostname.endsWith('.internal') ||
                hostname.endsWith('.local')
              ) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Probing internal or localhost addresses is restricted for security.' }));
                return;
              }

              const startTime = Date.now();
              const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                  'User-Agent': 'Chanakya-Audit-Scanner/1.0 (Defensive Compliance Probe; CERT-In & DPDP Baseline)',
                },
                redirect: 'follow',
                signal: AbortSignal.timeout(7000),
              });
              const latencyMs = Date.now() - startTime;

              const headersObj: Record<string, string> = {};
              response.headers.forEach((val, key) => {
                headersObj[key.toLowerCase()] = val;
              });

              const hsts = headersObj['strict-transport-security'] || null;
              const csp = headersObj['content-security-policy'] || null;
              const xfo = headersObj['x-frame-options'] || null;
              const xcto = headersObj['x-content-type-options'] || null;
              const rp = headersObj['referrer-policy'] || null;
              const serverHeader = headersObj['server'] || null;
              const cookies = headersObj['set-cookie'] || null;

              // Check security.txt
              let hasSecurityTxt = false;
              try {
                const secUrl = new URL('/.well-known/security.txt', targetUrl).toString();
                const secResp = await fetch(secUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
                hasSecurityTxt = secResp.status === 200;
              } catch {
                hasSecurityTxt = false;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  targetUrl,
                  status: response.status,
                  statusText: response.statusText,
                  latencyMs,
                  headers: headersObj,
                  hasSecurityTxt,
                  analysis: {
                    hstsPresent: !!hsts,
                    cspPresent: !!csp,
                    xfoPresent: !!xfo,
                    xctoPresent: !!xcto,
                    referrerPolicyPresent: !!rp,
                    serverLeakage: !!serverHeader,
                    serverValue: serverHeader,
                    isHttps: targetUrl.startsWith('https://'),
                  },
                })
              );
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to reach target URL';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: errorMessage }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
