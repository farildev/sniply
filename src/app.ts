import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import urlRoutes from './routes/url.routes';
import { urlController } from './controllers/url.controller';
import { errorHandler } from './middleware/errorHandler';
import { startClickFlushJob } from './jobs/clickFlush.job';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', urlRoutes);
app.get('/:shortCode', urlController.redirect);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(errorHandler);
startClickFlushJob();

export default app;
