import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

import cors from 'cors';
import express from 'express';

import routes from './infrastructure/router';

const app = express();
const tmpPath = join(cwd(), 'tmp');

// middelwares
app.use(cors());
app.use(express.json());
app.use(express.static(tmpPath));

app.use(`/`, routes);
app.get('/ping', (_, res) => {
  res.json({ pong: 'pong' });
});

export default app;
