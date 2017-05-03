import * as Kue from 'kue';
import Logger from '../Logger';
import Metric from '../model/Metric';
import Environment from '../model/Environment';
import { extractHostFromURL, resolveFullMetricName } from '../Utils';
import retriveWebsite from '../service/WebsiteService';
import { getLocationByIPAddress } from '../service/LocationService';
import Visitor from '../model/Visitor';
import { saveVisitorMetric } from '../service/VisitorMetricService';

const queue = Kue.createQueue();
queue.process('performance_log', 20, async (job, done) => {
  try {
    await consume(job.data.request, job.data.queries);
  } catch (error) {
    Logger.error('Error occurs:', error);
  }
  done();
});

async function consume(request: { ip: string, headers: any }, queries: any) {
  Logger.info('=> Performance Worker Received:', queries);
  Logger.info('=> IP:', request.ip);

  if (!request || ! queries) {
    Logger.error('Reject invalid work task');
    return;
  }

  const token = queries.token;
  const ipAddress = '210.30.193.70' || request.ip;
  const referer = request.headers.referer;
  const hostname = extractHostFromURL(referer);

  if (!referer) {
    Logger.error('Rejected: Can not find referer');
    return;
  }
  if (!token) {
    Logger.error('Rejected: Can not find token');
    return;
  }

  // Should accept queries
  const keys = Object.keys(queries);
  if (!keys || keys.length <= 0) {
    Logger.error('Rejected: Can not find queries');
    return;
  }

  // Search specified website
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
      metric[property] = queries[key];
    }
  }

  // Register environment infomation
  if (queries['os']) environment.OS = queries['os'];
  if (queries['br']) environment.browser = queries['br'];
  if (queries['bv']) environment.browerVersion = queries['bv'];
  if (queries['dc']) environment.device = queries['dc'];
  if (queries['dv']) environment.deviceVersion = queries['dv'];

  Logger.info('=> Visitor created:', visitor);

  // Get reporting time from client
  const timems = Object.keys(queries).filter(q => !isNaN(q as any))[0];

  // Save into database
  await saveVisitorMetric(token, referer, visitor, new Date(parseInt(timems)));
  Logger.info('Saved');
}