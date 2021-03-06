import { Request } from '../nepdb.d'
import { Observable } from 'rxjs'
import { NO_CONTENT } from 'http-status'

export default function (r: Request): Observable<Request> {
  let { req, res } = r
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match')
  res.header('Access-Control-Expose-Headers', 'etag, token')
  if (req.method === 'OPTIONS') {
    r.status = NO_CONTENT
    return Observable.throw(r)
  }
  return Observable.of(r)
}
