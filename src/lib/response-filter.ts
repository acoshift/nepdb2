import { Request } from '../nepdb.d'
import { Observable, Observer } from 'rxjs'
import * as _ from 'lodash'
import * as nepq from 'nepq'
import { reject } from '../utils'
import { INTERNAL_SERVER_ERROR } from 'http-status'

function f (x): void {
  if (_.isNil(x) || !_.isObject(x)) return
  _.forOwn(x, (v, k) => {
    // remove private field
    if (_.startsWith(k, '__')) {
      delete x[k]
      return
    }
    if (_.isPlainObject(v) || _.isArray(v)) {
      f(v)
    }
  })
}

export default function (r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    f(r.result)

    try {
      nepq.response(r.nq, r.result, res => {
        if (_.isUndefined(res)) {
          observer.error(reject(r, INTERNAL_SERVER_ERROR, 'NepQ'))
          return
        }
        r.result = res
        observer.next(r)
        observer.complete()
      })
    } catch (e) {
      observer.error(reject(r, INTERNAL_SERVER_ERROR, 'NepQ', `[${e.name}]: ${e.message}`))
    }
  })
}
