import { Request } from '../nepdb.d';
import { Observable } from 'rxjs';
import _ = require('lodash');
import { reject } from '../utils';
import httpStatus = require('http-status');

var ops = {
  create: require('./op/create'),
  read: require('./op/read'),
  update: require('./op/update'),
  delete: require('./op/delete'),
  query: require('./op/query'),
  restore: require('./op/restore'),
  count: require('./op/count'),
  list: require('./op/list'),
  login: require('./op/login'),
  user: require('./op/user'),
}

export = function(r: Request): Observable<Request> {
  let op = ops[r.nq.method];
  if (op) {
    return op(r);
  }

  return Observable.throw(reject(r, httpStatus.NOT_IMPLEMENTED));
}
