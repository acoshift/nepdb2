import { Request } from '../nepdb.d';
import { collection } from '../utils';

export = function(r: Request): void {
  let l = {
    ns: r.ns,
    user: r.user ? r.user._id : null,
    role: r.user ? r.user.role : null,
    nq: r.nq ? {
      method: r.nq.method,
      name: r.nq.name
    } : null,
    status: r.status
  };
  let c = collection(r, 'db.logs');
  if (c) c.insertOne(l, { w: 0 }, null);
}
