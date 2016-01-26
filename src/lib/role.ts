import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { collection } from '../utils';

export = function(r: Request): Observable<Request> {
  // try to get role from token first
  if (r.token && (!r.token.ns || r.token.ns === r.ns) && r.token.role) {
    r.role = r.token.role;
    return Observable.of(r);
  }

  // if no token, or no role in token then user is guest
  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.roles').find({ name: 'guest' }).limit(1).next((err, res) => {
      // ignore error
      if (res) r.role = res.dbs;
      observer.next(r);
      observer.complete();
    });
  });
}
