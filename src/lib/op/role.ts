import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, objectId } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  if (!r.user.role) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.roles').find({
      $or: [
        { _id: r.user.role },
        { name: r.user.role }
      ]
    }).limit(1).next((err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
        return;
      }
      r.result = res;
      observer.next(r);
      observer.complete();
    });
  });
}
