import * as Kue from 'kue';
import Logger from '../Logger';
import Error from '../model/Error';
import retriveWebsite from '../service/WebsiteService';
import { extractHostFromURL } from '../Utils';
import Environment from '../model/Environment';
import Visitor from '../model/Visitor';
import { getLocationByIPAddress } from '../service/LocationService';
import { saveErrorLogs } from '../service/ErrorService';

const queue = Kue.createQueue();
queue.process('error_log', 20, async (job, done) => {
  try {
    await consume(job.data.request, job.data.query, job.data.errors);
  } catch (error) {
    Logger.error('ErrorWorker Error:', error);
  }
  done();
});

async function consume(request: { ip: string, headers: any }, query: any, errors: Error[]) {
  Logger.info('Error Worker:', query);
  if (!request || !query || !errors || errors.length <= 0) {
    Logger.error('Rejected: invalid task');
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

  // Search specified website to check if it exists
  await retriveWebsite(hostname, token);

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
  visitor.errorLogs = errors;

  // Register environment infomation
  if (query['os']) environment.OS = query['os'];
  if (query['br']) environment.browser = query['br'];
  if (query['bv']) environment.browerVersion = query['bv'];
  if (query['dc']) environment.device = query['dc'];
  if (query['dv']) environment.deviceVersion = query['dv'];

  Logger.info('=> Visitor created:', visitor);

  // Get reporting time from client
  visitor.time = Date.now();

  // Save into database
  await saveErrorLogs(token, referer, visitor);
  Logger.info('ErrorLogs Saved');
}
