import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import nepq = require('nepq');
import { reject } from '../utils';
import httpStatus = require('http-status');
import _ = require('lodash');

export = function(r: Request): Observable<Request> {
  if (r.req.get('content-type') !== 'application/nepq') {
    return Observable.throw(reject(r, httpStatus.BAD_REQUEST, 'NepQ'));
  }

  return Observable.create((observer: Observer<Request>) => {
    let data = [];
    r.req.on('data', d => {
      data.push(d);
    }).on('end', () => {
      r.nq = nepq.parse(Buffer.concat(data).toString('utf8'));
      if (_.isNull(r.nq)) {
        observer.error(reject(r, httpStatus.BAD_REQUEST, 'NepQ'));
        return;
      }
      observer.next(r);
      observer.complete();
    }).on('error', (err: Error) => {
      observer.error(reject(r, httpStatus.BAD_REQUEST, err.name, err.message));
    });
  });
}
