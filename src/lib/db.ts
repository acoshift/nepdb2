import { Request, Config } from '../nepdb.d';
import { Observable, Observer } from 'rxjs';
import { MongoClient, Db } from 'mongodb';
import qs = require('querystring');
import httpStatus = require('http-status');
import { reject } from '../utils';

var db: Db = null;

var config = require('../config');

function newConnection() {
  return (<Observable<Db>>Observable.create((observer: Observer<Db>) => {
    let uri = (() => {
      let { user, pwd, host, port, maxPoolSize, authSource } = config.database;
      let credential = user && pwd ? `${user}:${qs.escape(pwd)}@`: '';
      host = host || 'localhost';
      port = port || 27017;
      let ql: string[] = [];
      if (maxPoolSize) ql.push(`maxPoolSize=${maxPoolSize}`);
      if (authSource) ql.push(`authSource=${authSource}`);
      let q = ql.join('&');
      if (q) q = '?' + q;
      return `mongodb://${credential}${host}:${port}/${q}`;
    })();

    MongoClient.connect(uri, (err, _db) => {
      if (err || !_db) {
        observer.error(null);
        return;
      }
      db = _db;
      observer.next(db);
      observer.complete();
    });
  })).publishLast();
}

var connection = newConnection();

function tryConnect() {
  connection.connect();
  connection.subscribe(null, err => {
    connection = newConnection();
    tryConnect();
  });
}

tryConnect();

export = function(r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    connection.subscribe(db => {
      r.db = db.db(r.ns);
      observer.next(r);
      observer.complete();
    }, err => {
      observer.error(reject(r, httpStatus.INTERNAL_SERVER_ERROR));
    });
  });
}
