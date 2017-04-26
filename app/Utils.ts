const regex = /:\/\/([^\d\:]*)[\:\d]*\//im;

/**
 * @param {string} url
 */
export function extractHostFromURL(url: string) {
  const retval = regex.exec(url);
  return !retval ? '' : retval[1];
}

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

export function resolveFullMetricName(abbreviation: string) {
  return metricMapper[abbreviation];
}

// An empty gif image
const buffer = new Buffer([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
  0x02, 0x44, 0x01, 0x00, 0x3b
]);

export function getEmptyGIFImage(): Buffer {
  return buffer;
}