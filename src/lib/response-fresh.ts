import { Request } from '../nepdb.d'
import { NOT_MODIFIED } from 'http-status'
import * as fresh from 'fresh'
import * as etag from 'etag'

export default function (r: Request): void {
  let { req, result } = r
  if (fresh(req.headers, { etag: etag(JSON.stringify(result)) })) {
    r.status = NOT_MODIFIED
    r.result = undefined
  }
}
