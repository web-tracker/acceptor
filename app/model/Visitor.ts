import Environment from './Environment';
import Metric from './Metric';

export default class Visitor {
  country: string;
  // Province or State
  regionName: string;
  city: string;
  // Network Provider Company
  networkISP: string;
  IPAddress: string;
  environment: Environment;
  performanceMetric: Metric;
}