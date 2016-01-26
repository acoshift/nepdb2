import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import nepq = require('nepq');
import { reject } from '../utils';
import httpStatus = require('http-status');

function f(x) {
  if (_.isNull(x) || !_.isObject(x)) return;
  _.forOwn(x, (v, k) => {
    // remove private field
    if (k.startsWith('__')) {
      delete x[k];
      return;
    }
    if (_.isPlainObject(v) || _.isArray(v)) {
      f(v);
    }
  });
}

export = function(r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    f(r.result);

    try {
      nepq.response(r.nq, r.result, res => {
        if (_.isUndefined(res)) {
          observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, 'NepQ'));
          return;
        }
        r.result = res;
        observer.next(r);
        observer.complete();
      });
    } catch(e) {
      observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, 'NepQ', `[${e.name}]: ${e.message}`));
    }
  });
}
