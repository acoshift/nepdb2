import { Request } from '../../nepdb.d';
import { Observable } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject } from '../../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  if (canAccess(r.role, 'c', r.ns) === 0) return Observable.throw(reject(r, httpStatus.UNAUTHORIZED));

  return Observable.of(r);
}
