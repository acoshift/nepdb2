import { Request, ReadOptions } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r, 'r');
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;
  if (nq.params.length > 2) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));

  let x = nq.params[0];
  let opt: ReadOptions = {};

  if (nq.params.length === 2) {
    opt = nq.params[1];
  }

  opt = {
    limit: opt.limit || 0,
    skip: opt.skip || 0
  };

  if (access === 2) {
    x._owner = r.user._id || r.user.name;
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(x).skip(opt.skip).limit(opt.limit).toArray((err, res) => {
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
