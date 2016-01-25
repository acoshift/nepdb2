import { Request, ReadOptions } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r.role, 'r', r.ns);
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !r.user._id) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;

  let opt: ReadOptions = {
    limit: nq.params[0] || 0,
    skip: nq.params[1] || 0
  };

  let query: any = {};
  if (access === 2) {
    query._owner = r.user._id || r.user.name;
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(query).skip(opt.skip).limit(opt.limit).toArray((err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
      } else {
        r.result = res;
        observer.next(r);
        observer.complete();
      }
    });
  });
}
