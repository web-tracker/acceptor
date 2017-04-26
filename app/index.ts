import * as Koa from 'koa';
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
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  // Each user won't have frequent requests
  max: 10
});

// TODO: Add ratelimiter
app.use(ratelimit);
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);

console.log(`listening on port ${port}`);

// Spawn several workers
const workerPath = path.join(__dirname, 'worker/bootstrap.js');
const worker = childProcess.fork(workerPath);

worker.on('exit', code => {
  console.log('Worker process exit', code);
});

process.on('exit', () => {
  worker.kill();
});

console.log('Worker pid:', worker.pid);