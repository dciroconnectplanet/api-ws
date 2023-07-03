import { join } from 'path';

import cors from 'cors';
import express from 'express';

import routes from './infrastructure/router';

const app = express();

// middelwares
app.use(cors());
app.use(express.json());
app.use(express.static(join(process.cwd(), 'tmp')));

app.use(`/`, routes);
app.get('/ping', (_, res) => {
  res.json({ pong: 'pong' });
});

export default app;
