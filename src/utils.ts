import {
  Config,
  RSTokenSecret,
  Token,
  User,
  Role,
  Request,
  ErrorResult
} from './nepdb.d';

import { ObjectID, Collection } from 'mongodb';
import _ = require('lodash');
import httpStatus = require('http-status');
import jwt = require('jsonwebtoken');
import ms = require('ms');

export function decode(input: string): string {
  return input ? new Buffer(input, 'base64').toString() : null;
}

export function objectId(id: string): ObjectID {
  try {
    return ObjectID.createFromHexString(id);
  } catch (e) {
    return null;
  }
}

export function json(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    return {};
  }
}

export function canAccess(r: Request, group: string, ns?: string): number {
  let role = r.role;
  ns = collectionName(r, ns);

  if (_.isNull(role)) return 0;
  if (_.isFinite(role)) return <number>role;
  if (_.isFinite(role['*'])) return <number>role['*'];
  if (role['*'] && _.isFinite(role['*'][group])) return role['*'][group];

  let c = ns.split('.');
  while (c.length) {
    let k = _.get<number | Role>(role, c.join('.'));
    if (_.isFinite(k)) return <number>k;
    if (k && _.isFinite(k[group])) return <number>k[group];
    c.pop();
  }

  return 0;
}

export function reject(r: Request, status?: number, name?: string, message?: string): Request {
  if (_.isUndefined(status)) status = httpStatus.INTERNAL_SERVER_ERROR;
  if (_.isUndefined(name)) name = 'NepDB';
  if (_.isUndefined(message)) message = httpStatus[status];

  r.status = status;
  r.result = <ErrorResult> {
    name: name,
    message: message
  };

  return r;
}

export function collectionName(r: Request, ns?: string): string {
  if (_.isUndefined(ns)) ns = r.nq.name;
  return ns;
}

export function collection(r: Request, ns?: string): Collection {
  if (!r.db) return null;
  return r.db.collection(collectionName(r, ns));
}

export function getTokenSecret(config: Config, pub?: boolean): string {
  let secret: string = null;
  if (_.isString(config.token.secret)) {
    secret = <string>config.token.secret;
  } else {
    if (pub === true) {
      secret = (<RSTokenSecret>config.token.secret).public;
    } else {
      secret = (<RSTokenSecret>config.token.secret).private;
    }
  }
  return secret;
}

export function makeToken(r: Request, user: User, role: number | Role, exp: string): string {
  if (!user || !user._id) return null; // do not make token for self-signed

  let config = r.config;
  let secret: string = getTokenSecret(config);

  let opt: any = {
    algorithm: config.token.algorithm
  };
  if (config.token.issuer) opt.issuer = config.token.issuer;
  if (exp || config.token.expiresIn) opt.expiresIn = exp || config.token.expiresIn;

  let obj: Token = {
    id: user._id.toHexString(),
    ns: r.ns,
    name: user.name,
    role: role
  };

  return jwt.sign(obj, secret, opt);
}
/*
export function setTokenCookie(r: Request, token: string, exp?: string) {
  r.res.cookie('token', token, {
    maxAge: <number>(exp ? ms(exp) : ms(r.config.cookie.maxAge)),
    secure: r.config.cookie.secure,
    httpOnly: r.config.cookie.httpOnly
  });
}
*/
