import { Request } from '../nepdb.d';
import { collection } from '../utils';

export = function(r: Request): void {
  let l = {
    ns: r.ns,
    user: r.user && r.user._id || r.user.name || null,
    nq: r.nq ? {
      method: r.nq.method,
      name: r.nq.name
    } : null,
    status: r.status,
    time: r.timestamp.end - r.timestamp.start
  };
  let c = collection(r, 'db.logs');
  if (c) c.insertOne(l, { w: 0 }, null);
  // console.log(JSON.stringify(l));
}
