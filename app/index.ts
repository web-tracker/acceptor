import * as Koa from 'koa';
import Logger from './Logger';
import * as path from 'path';
import * as Redis from 'ioredis';
import * as Ratelimit from 'koa-ratelimit';
import * as childProcess from 'child_process';
import router from './Router';

const port = 3000;
const app = new Koa();
const redis = new Redis();

const ratelimit = Ratelimit({
  db: redis,
  duration: 60000,
  errorMessage: 'Server is busy',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  // Each user cannot send too many requests
  max: 10
});

app.use(ratelimit);
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);

Logger.info(`listening on port ${port}`);

// Spawn several workers
const workerPath = path.join(__dirname, '../worker.js');
const worker = childProcess.fork(workerPath);

worker.on('exit', code => {
  Logger.info('Worker process exit', code);
});

process.on('exit', () => {
  worker.kill();
});

Logger.info('Worker pid:', worker.pid);