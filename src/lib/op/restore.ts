import { Request } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import * as _ from 'lodash'
import { canAccess, reject, collection, objectId } from '../../utils'
import { UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status'

export default function (r: Request): Observable<Request> {
  let access = canAccess(r, 'd', 'db.trash')
  if (access === 0) return Observable.throw(reject(r, UNAUTHORIZED))
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, UNAUTHORIZED))

  let nq = r.nq

  if (_.isEmpty(nq.params) || !_.every(nq.params, _.isString)) {
    return Observable.throw(reject(r, BAD_REQUEST))
  }

  let params = _(nq.params).map(objectId).filter(x => !!x).value()

  let query: any = { $or: [ { _id: { $in: params } }, { 'data._id': { $in: params } } ] }
  if (access === 2) {
    query._owner = r.user._id || r.user.name
  }

  return Observable.create((observer: Observer<Request>) => {
    let cursor = collection(r, 'db.trash').find(query)
    cursor.forEach(x => {
      collection(r, x.db).insertOne(x.data, { w: 0 }, null)
    }, null)
    collection(r, 'db.trash').deleteMany(query, (err, res) => {
      if (err) {
        observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
        return
      }
      if (res) {
        if (res.connection) res.connection = undefined
      }
      r.result = res
      observer.next(r)
      observer.complete()
    })
  })
}
