import { Request } from '../nepdb.d';
import { Observable } from 'rxjs';

export = function(r: Request): Observable<Request> {
  let { req, res } = r;
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match');
  res.header('Access-Control-Expose-Headers', 'etag');
  if (req.method === 'OPTIONS') {
    r.status = 204;
    return Observable.throw(r);
  }
  return Observable.of(r);
}
