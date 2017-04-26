import * as request from 'request';

const IPLocationServiceEndpoint = (ip: string) => `http://ip-api.com/json/${ip}`;

export interface Location {
  isp: string;
  country: string;
  regionName: string;
  city: string;
}

export function getLocationByIPAddress(ip: string) {
  const endpoint = IPLocationServiceEndpoint(ip);
  return new Promise<Location>((resolve, reject) => {
    request(endpoint, (error, response, body) => {
      if (error) return reject(error);
      const retval = JSON.parse(body);
      if (response.statusCode === 200 || retval.status === 'success') {
        resolve(retval);
      } else reject();
    });
  });
}