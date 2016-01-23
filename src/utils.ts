import { Config } from './nepdb.d';
import { ObjectID, Collection } from 'mongodb';
import { Role, Request, ErrorResult } from './nepdb.d';
import _ = require('lodash');
import httpStatus = require('http-status');
import jwt = require('jsonwebtoken');

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

export function canAccess(role: number | Role, group: string, ns: string): number {
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

export function makeToken(user: any, exp: string, config: Config): string {
  return jwt.sign({
    name: user.name,
    ns: user.ns
  }, config.token.secret, {
    algorithm: config.token.algorithm,
    expiresIn: exp || config.token.expiresIn,
    issuer: config.token.issuer
  });
}
