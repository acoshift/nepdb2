import { Request, User } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import * as _ from 'lodash'
import { reject, collection, makeToken } from '../../utils'
import { UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status'
import { compareSync } from 'bcryptjs'

export default function (r: Request): Observable<Request> {
  if (!r.ns) return Observable.throw(reject(r, BAD_REQUEST))
  let nq = r.nq
  let d
  if (nq.params.length === 2 || nq.params.length === 3) {
    if (!_.every(nq.params, _.isString)) {
      return Observable.throw(reject(r, BAD_REQUEST))
    }
    d = {
      name: nq.params[0],
      pwd: nq.params[1]
    }
    if (nq.params.length === 3) d.exp = nq.params[2]
  } else if (nq.params.length === 1 && _.isPlainObject(nq.params[0])) {
    if (!nq.params[0].name ||
        !nq.params[0].pwd ||
        !_.isString(nq.params[0].name) ||
        !_.isString(nq.params[0].pwd)) return Observable.throw(reject(r, BAD_REQUEST))
    d = {
      name: nq.params[0].name,
      pwd: nq.params[0].pwd
    }
    if (nq.params[0].exp) d.exp = nq.params[0].exp
  } else {
    return Observable.throw(reject(r, BAD_REQUEST))
  }

  r.user.name += ' => ' + d.name

  return Observable.create((observer: Observer<Request>) => {
    collection(r, 'db.users').find({ name: d.name }).limit(1).next((err, user: User) => {
      if (err) {
        observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
        return
      }

      if (!user ||
          user.name !== d.name ||
          !user.enabled ||
          !user.__pwd ||
          !compareSync(d.pwd, user.__pwd)) {
        observer.error(reject(r, UNAUTHORIZED))
        return
      }

      let query: any = {}
      if (_.isString(user.role)) {
        query.name = user.role
      } else {
        query._id = user.role
      }

      collection(r, 'db.roles').find(query).limit(1).next((err, role) => {
        if (err) {
          observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
          return
        }

        let token = makeToken(r, user, role.dbs, d.exp)
        user.role = role
        r.result = {
          token: token,
          user: user
        }

        observer.next(r)
        observer.complete()
      })
    })
  })
}
