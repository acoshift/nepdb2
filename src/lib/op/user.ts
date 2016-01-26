import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { reject, collection, objectId } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    // guest or self-signed
    if (!r.user._id) {
      r.result = {
        name: r.user.name,
        role: r.role
      }
      observer.next(r);
      observer.complete();
      return;
    }

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
        if (resolve !== true && resolve !== 1) {
          cb(_role);
          return;
        }

        let query: any = {};
        if (_.isString(_role)) {
          query.name = _role;
        } else {
          query._id = _role;
        }
        collection(r, 'db.roles').find(query).limit(1).next((err, res) => {
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
