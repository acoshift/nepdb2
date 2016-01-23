import { Request } from '../nepdb.d';
import { collection } from '../utils';

export = function(r: Request): void {
  let l = {
    ns: r.ns,
    user: r.user._id,
    role: r.user.role,
    nq: {
      method: r.nq.method,
      name: r.nq.name
    },
    status: r.status
  };
  collection(r, 'db.logs').insertOne(l, { w: 0 }, null);
}
