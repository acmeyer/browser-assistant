import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { errorHandler } from './errors';
import { Config } from './lib/config';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { saveInPinecone } from './lib/pinecone';

const app = express();

app.use((req, res, next) => {
  // /clean-urls/ -> /clean-urls
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(301, safepath + query);
    return;
  }
  next();
});
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(routes);
app.use((_req, res) => {
  const error = new Error("The requested resource couldn't be found.");
  error.name = 'NotFoundError';
  logger.error(error.message);
  res.status(404).json({ error: 'Not Found', message: error.message });
});
app.use(errorHandler);

exports.api = onRequest(
  {
    minInstances: Config.API_MIN_INSTANCE ? parseInt(Config.API_MIN_INSTANCE) : 0,
    timeoutSeconds: Config.API_TIMEOUT_SECONDS ? parseInt(Config.API_TIMEOUT_SECONDS) : 540,
  },
  app
);

export const onNoteCreated = onDocumentCreated('notes/{noteId}', async (event) => {
  if (!event.data) {
    return;
  }
  const { text, url } = event.data.data();
  await saveInPinecone(event.params.noteId, text, url);
});
