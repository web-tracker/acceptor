import {Context} from 'koa';
import * as Kue from 'kue';
import { getEmptyGIFImage } from '../Utils';

const queue = Kue.createQueue();
const buffer = getEmptyGIFImage();

const success = (ctx: Context) => {
  ctx.status = 200;
  ctx.type = 'image/gif';
  ctx.body = buffer;
};

const fail = (ctx: Context) => {
  ctx.status = 200;
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