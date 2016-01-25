// typescript import
import express = require('express');
import _ = require('lodash');
import { Observable } from 'rxjs';
import { Request, RSTokenSecret } from './nepdb.d';
import { decode } from './utils';
import httpStatus = require('http-status');

// javascript import
var etag = require('etag');

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
  preprocess: require('./lib/preprocess'),
  requestFilter: require('./lib/request-filter'),
  responseFresh: require('./lib/response-fresh'),
};

// config
import config = require('./config');
if (_.isString(config.token.secret)) {
  config.token.secret = decode(<string>config.token.secret);
} else {
  (<RSTokenSecret>config.token.secret).private = decode((<RSTokenSecret>config.token.secret).private);
  (<RSTokenSecret>config.token.secret).public = decode((<RSTokenSecret>config.token.secret).public);
}
config.server.port = config.server.port || 8000;

var request: (req, res) => void = (() => {
  let response = (r: Request) => {
    try {
      r.res.status(r.status);
      if (_.isUndefined(r.result)) {
        r.res.end();
      } else {
        r.res.json(r.result);
      }
    } catch(e) {}
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
      }
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
      .flatMap<Request>(libs.preprocess)
      .flatMap<Request>(libs.op)
      .flatMap<Request>(libs.responseFilter)
      .do(libs.responseFresh)
      .catch(r => Observable.of(r))
      .do(r => r.timestamp.end = Date.now())
      .do(libs.log)
      .catch(r => Observable.of(r))
      .subscribe(r => response(r));
  };
})();

var app = express();

// app config
app.disable('x-powered-by');
app.set('etag', config.server.etag);

app.use(request);

app.listen(config.server.port);
console.log(`Server listening on port ${config.server.port}`);

process.on('uncaughtException', (err: Error) => {
  console.error(err.stack);
  // TODO: send error to developer
  process.exit(1);
});
