import * as express from 'express'
import { Observable } from 'rxjs'
import * as _ from 'lodash'
import { Request } from './nepdb.d'
import libs from './libs'
import config from './config'

config.server.port = config.server.port || 8000

const app = express()
app.disable('x-powered-by')
app.set('etag', config.server.etag)
app.use(request)
app.listen(config.server.port)

function createRequest (req, res): Request {
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
  }
}

function response (r: Request): void {
  try {
    r.res.status(r.status)
    if (_.isUndefined(r.result)) {
      r.res.end()
    } else {
      r.res.json(r.result)
    }
  } catch (e) {}
}

function request (req, res): void {
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
    .subscribe(r => response(r))
}
