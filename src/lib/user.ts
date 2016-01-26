import { Request } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { collection, objectId } from '../utils';
import jwt = require('jsonwebtoken');

export = function(r: Request): Observable<Request> {
  // first, everyone is guest
  r.user = {
    _id: null,
    name: 'guest'
  };

  let p = r.token;
  if (p && p.ns && p.ns !== r.ns && p.name) r.user.name = p.name + ' => ' + r.user.name;
  if (!p || (!_.isUndefined(p.ns) && p.ns !== r.ns)) return Observable.of(r);

  r.user = {
    _id: objectId(p.id),
    name: p.name
  }

  return Observable.of(r);
/*
  // TODO: remove this for stateless
  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.users').find({ name: profile.name }).limit(1).next((err, res) => {
      r.user = res;
      observer.next(r);
      observer.complete();
    });
  });
*/
}
