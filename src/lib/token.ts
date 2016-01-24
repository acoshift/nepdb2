import { Request } from '../nepdb.d';
import _ = require('lodash');
import jwt = require('jsonwebtoken');
import { getTokenSecret } from '../utils';

export = function(r: Request): void {
  let req = r.req;

  let token = null;

  let p = req.get('authorization');
  if (p) {
    let [ m, t ] = p.split(' ');
    if (m.toLowerCase() === 'bearer' && _.isString(t) && t.trim() !== '') {
      token = t;
    }
  }

  if (!token) return;
/*
  // try get token from cookies
  if (!token) {
    if (req.signedCookies && req.signedCookies.token) {
      token = req.signedCookies.token;
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
  }
*/
  let secret = getTokenSecret(r.config, true);
  let t = null;
  try {
    t = jwt.verify(token, secret, { algorithms: [ r.config.token.algorithm ] });
  } catch(e) {}

  r.token = t;
}
