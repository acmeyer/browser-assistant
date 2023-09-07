import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './errors';
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('tiny'));
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
app.use(routes);
app.use((_req, res) => {
  const error = new Error("The requested resource couldn't be found.");
  error.name = 'NotFoundError';
  console.error(error);
  res.status(404).json({ error: 'Not Found', message: error.message });
});
app.use(errorHandler);

export default app;
