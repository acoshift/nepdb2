import { Request, ReadOptions } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import { canAccess, reject, collection } from '../../utils'
import * as _ from 'lodash'
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status'

export default function (r: Request): Observable<Request> {
  let access = canAccess(r, 'r')
  if (access === 0) return Observable.throw(reject(r, UNAUTHORIZED))
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, UNAUTHORIZED))

  let nq = r.nq

  if (!_.isNil(nq.params[0]) && !_.isFinite(nq.params[0])) return Observable.throw(reject(r, BAD_REQUEST))
  if (!_.isNil(nq.params[1]) && !_.isFinite(nq.params[1])) return Observable.throw(reject(r, BAD_REQUEST))

  let opt: ReadOptions = {
    limit: nq.params[0] || 0,
    skip: nq.params[1] || 0
  }

  let query: any = {}
  if (access === 2) {
    query._owner = r.user._id || r.user.name
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(query).skip(opt.skip).limit(opt.limit).toArray((err, res) => {
      if (err) {
        observer.error(reject(r, INTERNAL_SERVER_ERROR, err.name, err.message))
        return
      }
      r.result = res
      observer.next(r)
      observer.complete()
    })
  })
}
