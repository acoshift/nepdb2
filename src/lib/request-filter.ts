import { Request } from '../nepdb.d'
import { Observable } from 'rxjs'
import { reject } from '../utils'
import * as _ from 'lodash'
import { BAD_REQUEST } from 'http-status'

const allowMethod = ['OPTIONS', 'POST']

export default function (r: Request): Observable<Request> {
  let { req } = r
  if (_.some(allowMethod, x => x === req.method)) {
    return Observable.of(r)
  }
  return Observable.throw(reject(r, BAD_REQUEST))
}
