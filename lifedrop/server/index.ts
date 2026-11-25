import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimits';
import { errorHandler, notFound } from './middleware/errors';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.clientOrigin.split(','), credentials: false }));
app.use(express.json({ limit: '50kb' }));
app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => console.log(`LifeDrop API listening on http://localhost:${env.port}`));
