import * as Kue from 'kue';
import Error from '../model/Error';
import { getEmptyGIFImage } from '../Utils';
import Logger from '../Logger';

const queue = Kue.createQueue();
const buffer = getEmptyGIFImage();
const success = (ctx) => {
  ctx.status = 200;
  ctx.type = 'image/gif';
  ctx.body = buffer;
};

const fail = (ctx) => {
  ctx.status = 200;
  ctx.type = 'image/gif';
};

export default async function ErrorHandler (ctx) {
  const query = ctx.query;
  if (!query) {
    return fail(ctx);
  }

  try {
    const errors: Error[] = JSON.parse(query.err);
    delete query.err;

    // Dispatch a work task to worker
    queue.create('error_log', {
      request: {
        ip: ctx.request.ip,
        headers: ctx.request.headers
      },
      query: query,
      errors: errors
    }).save();
  } catch (error) {
    Logger.error('Error query parameters are incorrect');
    return fail(ctx);
  }

  success(ctx);
}