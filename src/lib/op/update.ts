import { Request } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, objectId } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let access = canAccess(r, 'u');
  if (access === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  let nq = r.nq;

  try {
    if (nq.params.length === 2) {
      if (_.isNull(nq.params[1])) throw null;
      if (!_.isPlainObject(nq.params[1])) throw null;
    } else if (nq.params.length === 3) {
      if (!_.isNull(nq.params[1]) && !_.isPlainObject(nq.params[1])) throw null;
      if (!_.isNull(nq.params[2]) && !_.isArray(nq.params[2])) throw null;
    } else { throw null; }
  } catch(e) { return Observable.throw(reject(r, httpStatus.BAD_REQUEST)); }

  let query: any;
  if (_.isString(nq.params[0])) {
    let objId = objectId(nq.params[0]);
    if (!objId) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
    query = { _id: objId };
  } else if (_.isArray(nq.params[0])) {
    let params = _(nq.params).map(objectId).filter(x => !!x).value();
    query = { _id: { $in: params } };
  } else if (_.isPlainObject(nq.params[0])) {
    query = nq.params[0];
  } else {
    return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
  }

  let doc: any = {
    $currentDate: { _update: true }
  };

  if (!_.isEmpty(nq.params[1])) {
    doc.$set = nq.params[1];
  }

  if (!_.isEmpty(nq.params[2])) {
    doc.$unset = {};
    _.forEach(nq.params[2], x => {
      doc.$unset[x] = "";
    });
  }

  if (access === 2) {
    query._owner = r.user._id || r.user.name;
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).updateMany(query, doc, (err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
      } else {
        if (res) {
          if (res.connection) res.connection = undefined;
        }
        r.result = res;
        observer.next(r);
        observer.complete();
      }
    });
  });
}
