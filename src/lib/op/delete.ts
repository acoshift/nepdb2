import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, objectId, collectionName } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r.role, 'd', r.ns);
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !r.user._id) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;

  if (_.isEmpty(nq.params) || !_.every(nq.params, _.isString)) {
    return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
  }

  let params = _(nq.params).map(objectId).filter(x => !!x).value();

  let query: any = { _id: { $in: params } };
  if (access === 2) {
    query._owner = r.user._id;
  }

  return Observable.create((observer: Observer<Request>) => {
    let ns = collectionName(r);
    let cursor = collection(r).find(query);
    let batch = collection(r, 'db.trash').initializeUnorderedBulkOp(null);
    let movedId = [];
    cursor.forEach(x => {
      let doc: any = { db: ns, data: x };
      if (r.user._id) doc._owner = r.user._id;
      batch.insert(doc);
      movedId.push(x._id);
    }, () => {
      try {
        batch.execute((err, res) => {
          if (err) {
            observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
            return;
          }
          let query: any = { _id: { $in: movedId } };
          collection(r).deleteMany(query, (err, res) => {
            if (err) {
              observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
              return;
            }
            if (res) {
              if (res.connection) res.connection = undefined;
            }
            r.result = res;
            observer.next(r);
            observer.complete();
          });
        });
      } catch(e) {
        // bulk with no operation
        r.result = {
          ok: 1,
          n: 0
        };
        observer.next(r);
        observer.complete();
      }
    });
  });
}
