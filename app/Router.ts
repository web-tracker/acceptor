import * as Router from 'koa-router';
import PerfermanceHandler from './handler/PerformanceHandler';
import ErrorHandler from './handler/ErrorHandler';

const router = new Router();
router.get('/perf.gif', PerfermanceHandler);
router.get('/error.gif', ErrorHandler);

export default router;