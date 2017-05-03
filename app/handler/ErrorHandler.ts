import { getEmptyGIFImage } from '../Utils';
import Logger from '../Logger';

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
  console.log('Incoming Error:', query);
  if (!query) {
    return fail(ctx);
  }

  const errorObject = JSON.parse(query.err);
  Logger.info(errorObject);

  success(ctx);
}