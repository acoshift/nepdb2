import { Request, Config } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import { MongoClient, Db } from 'mongodb';
import qs = require('querystring');
import httpStatus = require('http-status');
import { reject } from '../utils';

var db: Db = null;

function connect(config: Config, cb?: (err, db) => void): void {
  let uri = (() => {
    let { user, pwd, host, port, maxPoolSize } = config.database;
    let credential = user && pwd ? `${user}:${qs.escape(pwd)}@`: '';
    host = host || 'localhost';
    port = port || 27017;
    let q = maxPoolSize ? `?maxPoolSize=${maxPoolSize}` : '';
    return `mongodb://${credential}${host}:${port}/${q}`;
  })();

  MongoClient.connect(uri, (err, _db) => {
    if (_db) db = _db;
    if (cb) cb(err, _db);
  });
}

connect(require('../config'));

export = function(r: Request): Observable<Request> {
  if (db !== null) {
    r.db = db;
    return Observable.of(r);
  }
  return Observable.create((observer: Observer<Request>) => {
    connect(r.config, (err: Error, _db) => {
      if (err) {
        observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR, err.name, err.message));
        return;
      }
      r.db = db;
      observer.next(r);
      observer.complete();
    });
  });
}
