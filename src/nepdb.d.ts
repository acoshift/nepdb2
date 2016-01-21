import express = require('express');
import { Db } from 'mongodb';
import { NepQ } from 'nepq';

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
  compression: {
    level: number;
  };
  cookie: {
    expiresIn: string;
    secret: string;
  };
  token: {
    algorithm: string;
    expiresIn: string;
    issuer: string;
    secret: string;
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
  name: string;
  role: string;
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
  token: string;
  timestamp: RequestTimestamp;
}
