import {Context} from 'koa';
import * as Kue from 'kue';

const queue = Kue.createQueue();

// An empty gif image
const buffer = new Buffer([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
  0x02, 0x44, 0x01, 0x00, 0x3b
]);

const success = (ctx: Context) => {
  ctx.status = 200;
  ctx.type = 'image/gif';
  ctx.body = buffer;
};

const fail = (ctx: Context) => {
  ctx.status = 404;
  ctx.type = 'image/gif';
};

export default async function PerformanceHandler(ctx: Context) {
  const queries = ctx.query;
  if (!queries) {
    return fail(ctx);
  }

  // Dispatch a work task to worker
  queue.create('performance_log', {
    request: {
      ip: ctx.request.ip,
      headers: ctx.request.headers,
    },
    queries: queries
  }).save();

  success(ctx);
}