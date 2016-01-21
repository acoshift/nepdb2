import { Request, Config } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import { MongoClient, Db } from 'mongodb';
import qs = require('querystring');

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
    connect(r.config, (err, _db) => {
      if (err) {
        r.status = 500;
        r.result = err;
        observer.error(r);
        return;
      }
      r.db = db;
      observer.next(r);
      observer.complete();
    });
  });
}
