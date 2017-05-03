import Visitor from '../model/Visitor';
import connection from '../Database';

export function saveVisitorMetric(token: string, url: string, visitor: Visitor) {
  if (!visitor.performanceMetric) {
    throw new Error('No metric data is provided to savevisitorMetric()');
  }
  // Build insert statements
  const metric = {
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
    first_paint_time: visitor.performanceMetric.firstByteTime,
    first_meaningful_time: visitor.performanceMetric.firstMeaningfulTime,
    first_interaction_time: visitor.performanceMetric.firstInteractionTime,
    total_loading_time: visitor.performanceMetric.totalLoadingTime,
    downloading_time: visitor.performanceMetric.downloadingTime,
    dom_parsing_time: visitor.performanceMetric.DOMParsingTime,
    dns_lookup_time: visitor.performanceMetric.DNSLookupTime,
    first_byte_time: visitor.performanceMetric.firstByteTime,
    images_time: visitor.performanceMetric.imagesTime,
    styles_time: visitor.performanceMetric.stylesTime,
    scripts_time: visitor.performanceMetric.scriptsTime,
    time: visitor.time
  };
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO `metric` SET ?', metric, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}