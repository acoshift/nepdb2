import express = require('express');
import { Db, ObjectID } from 'mongodb';
import { NepQ } from 'nepq';

export interface RSTokenSecret {
  private: string;
  public: string;
}

export interface Config {
  server: {
    port: number;
    etag: string;
  };
  database: {
    user: string;
    pwd: string;
    host: string;
    port: number;
    maxPoolSize: number;
  };
  token: {
    algorithm: string;
    expiresIn: string;
    issuer: string;
    secret: string | RSTokenSecret;
  };
  bcrypt: {
    cost: number;
  };
}

export interface ErrorResult {
  name: string;
  message: string;
}

export interface User {
  _id: ObjectID;
  name: string;
  role?: ObjectID | string;
  enabled?: boolean;
  pwd?: string;
}

export interface Role {
  [key: string]: number | Role;
}

export interface RequestTimestamp {
  start: number;
  end: number;
}

export interface Request {
  req: express.Request;
  res: express.Response;
  config: Config;
  db: Db;
  ns: string;
  status: number;
  result: any | ErrorResult;
  user: User;
  role: number | Role;
  nq: NepQ;
  token: Token;
  timestamp: RequestTimestamp;
}

export interface ReadOptions {
  limit?: number;
  skip?: number;
}

export interface Token {
  id?: string; // undefined: self-signed
  ns?: string; // undefined: *
  name: string; // user.name
  role: any; // role.dbs
  issuer?: string;
  iat?: number;
  exp?: number;
}
