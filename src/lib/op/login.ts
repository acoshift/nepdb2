import { Request, ReadOptions } from '../../nepdb.d';
import { Observable, Observer } from 'rxjs';
import _ = require('lodash');
import { canAccess, reject, collection, collectionName } from '../../utils';
import httpStatus = require('http-status');
import bcrypt = require('bcryptjs');
import ms = require('ms');

function makeToken(user: any, exp: string): string {
  return '';
}

export = function(r: Request): Observable<Request> {
  let nq = r.nq;
  let d;
  if (nq.params.length === 2 || nq.params.length === 3) {
    if (!_.every(nq.params, _.isString)) {
      return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
    }
    d = {
      name: nq.params[0],
      pwd: nq.params[1]
    };
    if (nq.params.length === 3) d.exp = nq.params[2];
  } else if (nq.params.length === 1 && _.isPlainObject(nq.params[0])) {
    if (!nq.params[0].name ||
        !nq.params[0].pwd ||
        !_.isString(nq.params[0].name) ||
        !_.isString(nq.params[0].pwd)) return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
    d = {
      name: nq.params[0].name,
      pwd: nq.params[0].pwd
    };
    if (nq.params[0].exp) d.exp = nq.params[0].exp;
  } else {
    return Observable.throw(reject(r, httpStatus.BAD_REQUEST));
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.users').find({ name: d.name }).limit(1).next((err, res) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
        return;
      }

      if (!res ||
          !res.enabled ||
          !res.pwd ||
          !bcrypt.compareSync(d.pwd, res.pwd)) {
        observer.error(reject(r, httpStatus.UNAUTHORIZED));
        return;
      }
      let user = {
        name: d.name,
        ns: r.ns
      };
      let token = makeToken(user, d.exp);
      r.res.cookie('token', token, {
        maxAge: <number>(d.exp ? ms(d.exp) : ms(r.config.cookie.expiresIn)),
        secure: true,
        httpOnly: true
      });
      r.result = {
        token: token,
        user: res
      };
      collection(r, 'db.roles').find({
        $or: [
          { _id: res.role },
          { name: res.role }
        ]
      }).limit(1).next((err, res) => {
        if (err) {
          observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
          return;
        }
        if (res) r.result.user.role = res;
        observer.next(r);
        observer.complete();
      });
    });
  });
}
