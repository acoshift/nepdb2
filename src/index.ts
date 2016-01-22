// typescript import
import express = require('express');
// import bcrypt = require('bcryptjs');
import cookieParser = require('cookie-parser');
import _ = require('lodash');
// import jwt = require('jsonwebtoken');
// import ms = require('ms');
import { Observable } from 'rxjs';
import { Request } from './nepdb.d';
import { decode } from './utils';
import httpStatus = require('http-status');

// javascript import
var compression = require('compression');
var etag = require('etag');
var fresh = require('fresh');

// libs import
var libs = {
  cors: require('./lib/cors'),
  db: require('./lib/db'),
  ns: require('./lib/ns'),
  nq: require('./lib/nq'),
  log: require('./lib/log'),
  alias: require('./lib/alias'),
  token: require('./lib/token'),
  op: require('./lib/op'),
  responseFilter: require('./lib/response-filter'),
};

// config
import config = require('./config');
config.token.secret = decode(config.token.secret);
config.cookie.secret = decode(config.cookie.secret);
config.server.port = config.server.port || 8000;

var request: (req, res) => void = (() => {
  let response = (r: Request) => {
    console.log('process time: ' + (r.timestamp.end - r.timestamp.start) + ' ms');
    r.res.status(r.status);

    if (_.isUndefined(r.result)) {
      r.res.end();
    } else {
      r.res.json(r.result);
    }
  };

  let createRequest = (req, res): Request => {
    return {
      req: req,
      res: res,
      config: config,
      db: null,
      ns: '',
      status: 200,
      result: undefined,
      user: null,
      role: null,
      nq: null,
      token: null,
      timestamp: {
        start: 0,
        end: 0
      }
    };
  };
  return (req, res) => {
    Observable
      .of(createRequest(req, res))
      .do(r => r.timestamp.start = Date.now())
      .do(libs.ns)
      .flatMap<Request>(libs.nq)
      .do(libs.alias)
      .do(libs.token)
      .flatMap<Request>(libs.db)
      .flatMap<Request>(libs.cors)
      .flatMap<Request>(libs.op)
      .do(libs.responseFilter)
      .catch(r => Observable.of(r))
      .do(r => r.timestamp.end = Date.now())
      .do(libs.log)
      .subscribe(r => response(r));
  };
})();

var app = express();

// app config
app.set('etag', config.server.etag);

app.use(compression(config.compression));
app.use(cookieParser(config.cookie.secret));

app.use(request);

app.listen(config.server.port);
console.log(`Server listening on port ${config.server.port}`);

process.on('uncaughtException', (err: Error) => {
  console.error(err.stack);
});
