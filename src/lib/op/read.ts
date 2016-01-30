import { Request } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import { canAccess, reject, collection, objectId } from '../../utils'
import * as _ from 'lodash'
import { UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status'

export default function (r: Request): Observable<Request> {
  let access = canAccess(r, 'r')
  if (access === 0) return Observable.throw(reject(r, UNAUTHORIZED))
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, UNAUTHORIZED))

  let nq = r.nq

  if (!_.every(nq.params, _.isString)) return Observable.throw(reject(r, BAD_REQUEST))

  let params = _(nq.params).map(objectId).filter(x => !!x).value()

  let query: any = { _id: { $in: params } }
  if (access === 2) {
    query._owner = r.user._id || r.user.name
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(query).toArray((err, res) => {
      if (err) {
        observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
      } else {
        r.result = res
        observer.next(r)
        observer.complete()
      }
    })
  })
}
