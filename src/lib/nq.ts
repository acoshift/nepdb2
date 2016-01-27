import { Request } from '../nepdb.d'
import { Observable, Observer } from 'rxjs'
import * as nepq from 'nepq'
import { reject } from '../utils'
import * as _ from 'lodash'
import { BAD_REQUEST } from 'http-status'

export default function (r: Request): Observable<Request> {
  if (r.req.get('content-type') !== 'application/nepq') {
    return Observable.throw(reject(r, BAD_REQUEST, 'NepQ'))
  }

  return Observable.create((observer: Observer<Request>) => {
    let data = []
    r.req.on('data', d => {
      data.push(d)
    }).on('end', () => {
      r.nq = nepq.parse(Buffer.concat(data).toString('utf8'))
      if (_.isNull(r.nq)) {
        observer.error(reject(r, BAD_REQUEST, 'NepQ'))
        return
      }
      observer.next(r)
      observer.complete()
    }).on('error', (err: Error) => {
      observer.error(reject(r, BAD_REQUEST, err.name, err.message))
    })
  })
}
