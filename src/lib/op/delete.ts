import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, objectId } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r.role, 'd', r.ns);
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !r.user._id) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;

  if (!_.every(nq.params, _.isString)) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));

  let params = _(nq.params).map(objectId).filter(x => !!x).value();

  let query: any = { _id: { $in: params } };
  if (access === 2) {
    query._owner = r.user._id;
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(query).toArray((err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
        return;
      }
      if (_.isEmpty(res)) {
        r.result = {
          ok: 1,
          n: 0
        };
        observer.next(r);
        observer.complete();
        return;
      }
      if (r.user._id) {
        _.forEach(res, x => x._owner = r.user._id);
      }
      collection(r, 'db.trash').insertMany(res, { w: 0 }, null);
      collection(r).deleteMany(query, (err, res) => {
        if (err) {
          observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
          return;
        }
        r.result = res;
        observer.next(r);
        observer.complete();
      });
    });
  });
}
