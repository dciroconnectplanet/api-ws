import { join } from 'path';
import { cwd } from 'process';

import cors from 'cors';
import express from 'express';

import routes from './infrastructure/router';

const app = express();

// middelwares
app.use(cors());
app.use(express.json());
app.use(express.static(join(cwd(), 'tmp')));
console.log({ static: cwd() });
console.log({ mainFile: require.main?.filename });

app.use(`/`, routes);
app.get('/ping', (_, res) => {
  res.json({ pong: 'pong' });
});

export default app;
