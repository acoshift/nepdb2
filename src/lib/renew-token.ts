import { Request } from '../nepdb.d';
import _ = require('lodash');
import { makeToken } from '../utils';
import ms = require('ms');

export = function(r: Request): void {
  let user = {
    name: r.user.name,
    ns: r.ns
  };
  let token = makeToken(user, null, r.config);
  if (!token) return;
  if (r.req.get('authorization')) r.res.set('token', token);
  r.res.cookie('token', token, {
    maxAge: ms(r.config.cookie.maxAge),
    secure: r.config.cookie.secure,
    httpOnly: r.config.cookie.httpOnly
  });
}
