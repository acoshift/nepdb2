import { Request } from '../nepdb.d';
import { Observable } from 'rxjs';
import { reject } from '../utils';
import httpStatus = require('http-status');

export = function(r: Request): Observable<Request> {
  let { req } = r;
  if (req.method !== 'OPTIONS' || req.method !== 'POST') {
    return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
  }
  return Observable.of(r);
}
