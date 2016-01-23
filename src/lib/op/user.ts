import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, objectId } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  if (!r.user._id) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.users').find({ _id: r.user._id }).limit(1).next((err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
        return;
      }
      if (!res || !res.enabled) {
        observer.error(reject(r, httpStatus.NOT_FOUND));
        return;
      }
      r.result = res;
      let _role = res.role;
      r.result.role = ([resolve], nq, cb) => {
        if (!resolve) {
          cb(_role);
          return;
        }
        collection(r, 'db.roles').find({
          $or: [
            { _id: _role },
            { name: _role }
          ]
        }).limit(1).next((err, res) => {
          if (err) {
            cb(null);
            return;
          }
          cb(res);
        });
      };
      observer.next(r);
      observer.complete();
    });
  });
}
