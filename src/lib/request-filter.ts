import { Request } from '../nepdb.d';
import { Observable } from 'rxjs';
import { reject } from '../utils';
import _ = require('lodash');
import httpStatus = require('http-status');

var allowMethod = ['OPTIONS', 'POST'];

export = function(r: Request): Observable<Request> {
  let { req } = r;
  if (_.some(allowMethod, x => x === req.method)) {
    return Observable.of(r);
  }
  return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
}
