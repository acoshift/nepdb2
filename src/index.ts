// typescript import
import express = require('express');
// import bcrypt = require('bcryptjs');
import cookieParser = require('cookie-parser');
import _ = require('lodash');
// import jwt = require('jsonwebtoken');
// import ms = require('ms');
import { Observable } from 'rxjs';
import { Request, RSTokenSecret } from './nepdb.d';
import { decode } from './utils';

// javascript import
// var compression = require('compression');
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
  user: require('./lib/user'),
  role: require('./lib/role'),
  renewToken: require('./lib/renew-token'),
  preprocess: require('./lib/preprocess'),
  requestFilter: require('./lib/request-filter'),
};

// config
import config = require('./config');
if (_.isString(config.token.secret)) {
  config.token.secret = decode(<string>config.token.secret);
} else {
  (<RSTokenSecret>config.token.secret).private = decode((<RSTokenSecret>config.token.secret).private);
  (<RSTokenSecret>config.token.secret).public = decode((<RSTokenSecret>config.token.secret).public);
}
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
      ns: 'nepdb',
      status: 200,
      result: undefined,
      user: null,
      role: null,
      nq: null,
      token: null,
      timestamp: {
        start: 0,
        end: 0
      },
      authorization: null
    };
  };
  return (req, res) => {
    Observable
      .of(createRequest(req, res))
      .do(r => r.timestamp.start = Date.now())
      .flatMap<Request>(libs.requestFilter)
      .do(libs.ns)
      .flatMap<Request>(libs.db)
      .flatMap<Request>(libs.cors)
      .flatMap<Request>(libs.nq)
      .do(libs.alias)
      .do(libs.token)
      .flatMap<Request>(libs.user)
      .flatMap<Request>(libs.role)
      .do(libs.renewToken)
      .flatMap<Request>(libs.preprocess)
      .flatMap<Request>(libs.op)
      .flatMap<Request>(libs.responseFilter)
      .catch(r => Observable.of(r))
      .do(r => r.timestamp.end = Date.now())
      .do(libs.log)
      .subscribe(r => response(r));
  };
})();

var app = express();

// app config
app.set('etag', config.server.etag);

// app.use(compression(config.compression));
app.use(cookieParser(config.cookie.secret));

app.use(request);

app.listen(config.server.port);
console.log(`Server listening on port ${config.server.port}`);

process.on('uncaughtException', (err: Error) => {
  console.error(err.stack);
});
