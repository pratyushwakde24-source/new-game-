import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.ts';
import { SERVER_CONFIG } from './config/index.ts';

dotenv.config();

const app = express();
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Start server when run standalone
if (process.env.NODE_ENV !== 'test') {
  const PORT = SERVER_CONFIG.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SPARKVERSE] Backend services active on port ${PORT}`);
  });
}

export default app;
