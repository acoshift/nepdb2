import { Request, ReadOptions } from '../../nepdb.d'
import { Observable, Observer } from 'rxjs'
import { canAccess, reject, collection } from '../../utils'
import { UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status'

export default function (r: Request): Observable<Request> {
  let access = canAccess(r, 'r')
  if (access === 0) return Observable.throw(reject(r, UNAUTHORIZED))
  if (access === 2 && !(r.user._id || r.user.name)) return Observable.throw(reject(r, UNAUTHORIZED))

  let nq = r.nq
  if (nq.params.length > 2) return Observable.throw(reject(r, BAD_REQUEST))

  let x = nq.params[0]
  let opt: ReadOptions = {}

  if (nq.params.length === 2) {
    opt = nq.params[1]
  }

  opt = {
    limit: opt.limit || 0,
    skip: opt.skip || 0
  }

  if (access === 2) {
    x._owner = r.user._id || r.user.name
  }

  return Observable.create((observer: Observer<Request>) => {
    collection(r).find(x).skip(opt.skip).limit(opt.limit).toArray((err, res) => {
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
