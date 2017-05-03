import Visitor from '../model/Visitor';
import connection from '../Database';

export function saveErrorLogs(token: string, url: string, visitor: Visitor) {
  if (!visitor.errorLogs) {
    throw new Error('No metric data is provided to saveErrorLogs()');
  }
  // Build insert statements
  const errorLogs = {
    site_token: token,
    page_url: url,
    country: visitor.country,
    region: visitor.regionName,
    city: visitor.city,
    network_isp: visitor.networkISP,
    ip_address: visitor.IPAddress,
    os: visitor.environment.OS,
    browser: visitor.environment.browser,
    browser_version: visitor.environment.browerVersion,
    device: visitor.environment.device,
    device_version: visitor.environment.deviceVersion,
    time: visitor.time
  };

  // Iterate through error logs and build query promises
  const tasks: any[] = [];
  for (const error of visitor.errorLogs) {
    const task = Object.assign({
      script_url: error.scriptURI,
      message: error.message,
      line: error.line,
      column: error.column,
      stack: error.stack
    }, errorLogs);
    tasks.push(task);
  }

  // Concurrently insert error logs
  return Promise.all(tasks.map(t => insert(t)));
}

function insert(errorLog) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO `error` SET ?', errorLog, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}