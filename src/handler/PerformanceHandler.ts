import {Context} from 'koa';
import Metric from '../model/Metric';
import Environment from '../model/Environment';

const metricMapper = {
  fp: 'firstPaintTime',
  fb: 'firstByteTime',
  fm: 'firstMeaningfulTime',
  fi: 'firstInteractionTime',
  tl: 'totalLoadingTime',
  dl: 'downloadingTime',
  dp: 'DOMParsingTime',
  du: 'DNSLookupTime',
  im: 'imagesTime',
  ss: 'stylesTime',
  sc: 'scriptsTime'
};

const success = (ctx: Context) => {
  ctx.status = 200;
  ctx.type = 'image/gif';
  ctx.body = 'WebTracker';
};

const fail = (ctx: Context) => {
  ctx.status = 404;
  ctx.type = 'image/gif';
};

export default async function PerformanceHandler(ctx: Context) {
  console.log(ctx.query);
  const queries = ctx.query;
  if (!queries) return fail(ctx);

  // Process perf data asynchrously
  performanceDataProcessor(queries);
  success(ctx);
}

function performanceDataProcessor(queries: Object) {
  // Should accept queries
  const keys = Object.keys(queries);
  if (!keys || keys.length <= 0) return;

  // Abstract performance infomation
  const metric = new Metric();
  const environment = new Environment();
  for (const key of keys) {
    const property = metricMapper[key];
    if (property) {
      metric[property] = queries[key];
    }
  }

  /**parameters['os'] = environment.operatingSystem._type.toLowerCase();
    parameters['br'] = environment.browser._type.toLowerCase();
    parameters['bv'] = environment.browser.version.toLowerCase();
    parameters['dc'] = environment.device.type;
    parameters['dv'] = environment.device.version; */

  environment.OS = queries['os'];
  environment.browser = queries['br'];
  environment.browerVersion = queries['bv'];
  environment.device = queries['dc'];
  environment.device = queries['dv'];

  console.log('After processed:', metric);
};