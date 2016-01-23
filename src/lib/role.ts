import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { collection } from '../utils';
import jwt = require('jsonwebtoken');

export = function(r: Request): Observable<Request> {
  if (!r.user) return Observable.of(r);

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.roles').find({
      $or: [
        { _id: r.user.role },
        { name: r.user.role }
      ]
    }).limit(1).next((err, res) => {
      r.role = res.dbs;
      observer.next(r);
      observer.complete();
    });
  });
}
