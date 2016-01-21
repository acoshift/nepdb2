import { Request, ErrorResult } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import nepq = require('nepq');

export = function(r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    if (r.req.get('content-type') !== 'application/nepq') {
      r.status = 400;
      let result: ErrorResult = {
        name: 'NepQ',
        message: 'invalid content-type'
      };
      r.result = result;
      observer.error(r);
      return;
    }

    let data = [];
    r.req.on('data', d => {
      data.push(d);
    }).on('end', () => {
      r.nq = nepq.parse(Buffer.concat(data).toString('utf8'));
      observer.next(r);
      observer.complete();
    }).on('error', (err: Error) => {
      r.status = 400;
      let result: ErrorResult = {
        name: err.name,
        message: err.message
      }
      observer.error(r);
    });
  });
}
