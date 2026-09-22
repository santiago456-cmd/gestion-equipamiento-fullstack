import cors from 'cors';
import { env } from '../config/env.js';

export const corsMiddleware = cors({
  origin: env.corsOrigin,
  credentials: true // obligatorio para que el navegador mande/reciba cookies cross-site
});
