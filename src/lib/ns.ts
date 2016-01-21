import { Request } from '../nepdb.d';
import _ = require('lodash');

export = function(r: Request): void {
  r.ns = _(r.req.path.split('/')).filter(x => x !== '').join('.');
}
