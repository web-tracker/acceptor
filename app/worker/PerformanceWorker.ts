import * as Kue from 'kue';
import Metric from '../model/Metric';
import Environment from '../model/Environment';
import { extractHostFromURL, resolveFullMetricName } from '../Utils';
import retriveWebsite from '../service/WebsiteService';
import { getLocationByIPAddress } from '../service/LocationService';

const queue = Kue.createQueue();
queue.process('performance_log', 20, async (job, done) => {
  await consume(job.data.request, job.data.queries);
  done();
});

async function consume(request: { ip: string, headers: any }, queries: any) {
  console.log('=> Performance Worker Received:', queries);
  console.log('=> IP:', request.ip);

  if (!request || ! queries) {
    return;
  }

  const token = queries.token;
  const ipAddress = '210.30.193.70' || request.ip;
  const referer = request.headers.referer;
  const hostname = extractHostFromURL(referer);

  if (!referer) {
    console.log('Lack of referer');
    return;
  }
  if (!token) {
    console.log('Should have token string in URL');
    return;
  }

  // Should accept queries
  const keys = Object.keys(queries);
  if (!keys || keys.length <= 0) {
    console.log('Lack of query items');
    return;
  }

  // Search specified website
  await retriveWebsite(hostname, token);

  // Get network and locations
  const location = await getLocationByIPAddress(ipAddress);
  console.log(location.city);

  // Abstract performance infomation
  const metric = new Metric();
  const environment = new Environment();
  for (const key of keys) {
    const property = resolveFullMetricName(key);
    if (property) {
      metric[property] = queries[key];
    }
  }

  // Register environment infomation
  if (queries['os']) {
    environment.OS = queries['os'];
  }
  if (queries['br']) {
    environment.browser = queries['br'];
  }
  if (queries['bv']) {
    environment.browerVersion = queries['bv'];
  }
  if (queries['dc']) {
    environment.device = queries['dc'];
  }
  if (queries['dv']) {
    environment.deviceVersion = queries['dv'];
  }

  console.log('=> After processed:', metric);
  console.log('=> Environment Info:', environment);
}