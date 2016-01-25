import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  if (canAccess(r.role, 'c', r.ns) === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;
  if (_.isEmpty(nq.params)) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
  if (!_.every(nq.params, _.isPlainObject)) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));

  // add owner to object if empty
  if (r.user._id) {
    _.forEach(nq.params, x => {
      if (!x._owner) x._owner = r.user._id;
    });
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).insertMany(nq.params, (err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
      } else {
        if (res) {
          if (res.ops) res.ops = undefined;
        }
        r.result = res;
        observer.next(r);
        observer.complete();
      }
    });
  });
}
