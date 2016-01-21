import { Request } from '../nepdb.d';

export = function(r: Request): void {
  let req = r.req;

  // try get from header
  let token = null;

  let p = req.get('authorization');
  if (p) {
    let [ m, t ] = p.split(' ');
    if (m.toLowerCase() === 'bearer') {
      token = t;
    }
  }

  // try get token from cookies
  if (!token) {
    if (req.signedCookies && req.signedCookies.token) {
      token = req.signedCookies.token;
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
  }

  r.token = token;
}
