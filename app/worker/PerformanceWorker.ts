import * as Kue from 'kue';
import Logger from '../Logger';
import Metric from '../model/Metric';
import Environment from '../model/Environment';
import { extractHostFromURL, resolveFullMetricName } from '../Utils';
import retriveWebsite from '../service/WebsiteService';
import { getLocationByIPAddress } from '../service/LocationService';
import Visitor from '../model/Visitor';
import { saveVisitorMetric } from '../service/MetricService';

const queue = Kue.createQueue();
queue.process('performance_log', 20, async (job, done) => {
  try {
    await consume(job.data.request, job.data.queries);
  } catch (error) {
    Logger.error('Performance Worker Error:', error);
  }
  done();
});

async function consume(request: { ip: string, headers: any }, query: any) {
  Logger.info('=> Performance Worker Received:', query);
  Logger.info('=> IP:', request.ip);

  if (!request || !query) {
    Logger.error('Reject invalid work task');
    return;
  }

  const token = query.token;
  const ipAddress = request.ip;
  const referer = request.headers.referer;
  const hostname = extractHostFromURL(referer) as string;

  if (!referer) {
    Logger.error('Rejected: Can not find referer');
    return;
  }
  if (!token) {
    Logger.error('Rejected: Can not find token');
    return;
  }

  // Should accept queries
  const keys = Object.keys(query);
  if (!keys || keys.length <= 0) {
    Logger.error('Rejected: Can not find queries');
    return;
  }

  // Search specified website to check if it exists
  await retriveWebsite(hostname, token);

  // Get network and locations
  const metric = new Metric();
  const environment = new Environment();
  const visitor = new Visitor();

  const location = await getLocationByIPAddress(ipAddress);

  // Contruct a visitor
  visitor.city = location.city;
  visitor.regionName = location.regionName;
  visitor.country = location.country;
  visitor.IPAddress = ipAddress;
  visitor.networkISP = location.isp;
  visitor.environment = environment;
  visitor.performanceMetric = metric;

  // Abstract performance infomation
  for (const key of keys) {
    const property = resolveFullMetricName(key);
    if (property) {
      metric[property] = query[key];
    }
  }

  // Register environment infomation
  if (query['os']) environment.OS = query['os'];
  if (query['br']) environment.browser = query['br'];
  if (query['bv']) environment.browerVersion = query['bv'];
  if (query['dc']) environment.device = query['dc'];
  if (query['dv']) environment.deviceVersion = query['dv'];

  Logger.info('=> Visitor created:', visitor);

  // Get reporting time from client
  const timems = Object.keys(query).filter(q => !isNaN(q as any))[0];
  visitor.time = new Date(parseInt(timems));

  // Save into database
  await saveVisitorMetric(token, referer, visitor);
  Logger.info('Performance Metric Saved');
}
