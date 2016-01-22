import { Request } from '../nepdb.d';
import _ = require('lodash');
import nepq = require('nepq');
import { ObjectID } from 'mongodb';

export = function(r: Request): void {
  let f = x => {
    if (_.isNull(x) || !_.isObject(x)) return;
    _.forOwn(x, (v, k) => {
      if (k === 'pwd' || k.substr(0, 2) === '__') {
        delete x[k];
        return;
      }
      if (_.isPlainObject(v) || _.isArray(v)) {
        f(v);
      }
    });
  };
  f(r.result);
  r.result = nepq.response(r.nq, r.result);
}
