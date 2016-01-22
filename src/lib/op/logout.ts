import { Request } from '../../nepdb.d';
import { Observable } from 'rxjs';

export = function(r: Request): Observable<Request> {
  r.res.clearCookie('token');
  r.result = { ok: 1 };
  return Observable.of(r);
}
