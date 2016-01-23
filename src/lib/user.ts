import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { collection } from '../utils';
import jwt = require('jsonwebtoken');

export = function(r: Request): Observable<Request> {
  r.user = {
    _id: null,
    name: 'guest',
    role: null
  };
  if (!r.token) return Observable.of(r);
  let profile;
  try {
    profile = jwt.verify(r.token, r.config.token.secret, { algorithms: [ r.config.token.algorithm ] });
  } catch(e) {}
  if (!profile) return Observable.of(r);

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.users').find({ name: profile.name }).limit(1).next((err, res) => {
      r.user = res;
      observer.next(r);
      observer.complete();
    });
  });
}
