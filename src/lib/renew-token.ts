import { Request } from '../nepdb.d';
import _ = require('lodash');
import { makeToken } from '../utils';
import ms = require('ms');

export = function(r: Request): void {
  /*if (!r.authorization || !r.token) return;

  let token = makeToken(r, r.user, r.role, null);
  if (!token) return;
  if (r.authorization === 'header') {
    r.res.set('token', token);
  } else if (r.authorization === 'cookie') {
    setTokenCookie(r, token);
  }*/
}
