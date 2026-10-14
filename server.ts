import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes/api.ts';
import { SERVER_CONFIG } from './server/config/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();
  app.use(express.json());

  // Mount API endpoints
  app.use('/api', apiRouter);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve pre-built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = SERVER_CONFIG.port || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SPARKVERSE] Full-stack engine operational on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });

  return { app, server };
}

// Start standalone if executed directly
if (process.env.NODE_ENV !== 'test') {
  createServer().catch((err) => {
    console.error('[SPARKVERSE] Fatal error starting server:', err);
    process.exit(1);
  });
}
