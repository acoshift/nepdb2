import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r.role, 'r', r.ns);
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !r.user._id) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;
  if (nq.params.length > 2) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));

  let x = nq.params[0];

  if (access === 2) {
    x._owner = r.user._id;
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).count(x, (err, res) => {
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
