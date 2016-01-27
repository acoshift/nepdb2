import { Request } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import * as _ from 'lodash'
import { canAccess, reject, collection } from '../../utils'
import { UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status'

export default function (r: Request): Observable<Request> {
  if (canAccess(r, 'c') === 0) return Observable.throw(reject(r, UNAUTHORIZED))

  let nq = r.nq
  if (_.isEmpty(nq.params)) return Observable.throw(reject(r, BAD_REQUEST))
  if (!_.every(nq.params, _.isPlainObject)) return Observable.throw(reject(r, BAD_REQUEST))

  // add owner to object if empty
  if (r.user._id || r.user.name) {
    _.forEach(nq.params, x => {
      if (!x._owner) x._owner = r.user._id || r.user.name
    })
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).insertMany(nq.params, (err, res) => {
      if (err) {
        observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
      } else {
        if (res) {
          if (res.ops) res.ops = undefined
        }
        r.result = res
        observer.next(r)
        observer.complete()
      }
    })
  })
}
