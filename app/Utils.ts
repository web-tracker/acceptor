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