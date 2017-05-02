import connection from '../Database';

export default function retriveWebsite(hostname: string, token: string) {
  return new Promise((resolve, reject) => {
    connection.query(
      'select * from `site` where hostname=? and token=?',
      [hostname, token],
      (error, results) => {
        if (error) return reject(error);
        if (!results || results.length !== 1) {
          return reject('Could not find specific website');
        }
        resolve(results[0]);
    });
  });
}