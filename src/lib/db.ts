import { Request } from '../nepdb.d'
import { Observable, Observer, ConnectableObservable } from 'rxjs'
import { MongoClient, Db } from 'mongodb'
import * as qs from 'querystring'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import { reject } from '../utils'
import config from '../config'

let db: Db = null

function newConnection (): ConnectableObservable<Db> {
  return (<Observable<Db>> Observable.create((observer: Observer<Db>) => {
    let uri = (() => {
      let { user, pwd, host, port, maxPoolSize, authSource } = config.database
      let credential = user && pwd ? `${user}:${qs.escape(pwd)}@` : ''
      host = host || 'localhost'
      port = port || 27017
      let ql: string[] = []
      if (maxPoolSize) ql.push(`maxPoolSize=${maxPoolSize}`)
      if (authSource) ql.push(`authSource=${authSource}`)
      let q = ql.join('&')
      if (q) q = '?' + q
      return `mongodb://${credential}${host}:${port}/${q}`
    })()

    MongoClient.connect(uri, (err, _db) => {
      if (err || !_db) {
        observer.error(null)
        return
      }
      db = _db
      observer.next(db)
      observer.complete()
    })
  })).publishLast()
}

let connection = newConnection()

function tryConnect (): void {
  connection.connect()
  connection.subscribe(null, err => {
    connection = newConnection()
    tryConnect()
  })
}

tryConnect()

export default function (r: Request): Observable<Request> {
  return Observable.create((observer: Observer<Request>) => {
    connection.subscribe(db => {
      r.db = db.db(r.ns)
      observer.next(r)
      observer.complete()
    }, err => {
      observer.error(reject(r, INTERNAL_SERVER_ERROR))
    })
  })
}
