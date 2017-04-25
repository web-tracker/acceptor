import * as Koa from 'koa';
import router from './Router';

const port = 3000;
const app = new Koa();

// Add ratelimiter
app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);
console.log(`listening on port ${port}`);