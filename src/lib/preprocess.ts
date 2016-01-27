import { Request, Config } from '../nepdb.d'
import { Observable } from 'rxjs'
import * as _ from 'lodash'
import { objectId } from '../utils'
import { hashSync } from 'bcryptjs'

function calc (k, v, config: Config): any {
  switch (k) {
    case '$bcrypt':
      return hashSync(v, config.bcrypt.cost)
    case '$id':
      return objectId(v)
    case '$date':
      return new Date(v)
  }
  return null
}

function preprocess (param, config: Config): void {
  _.forOwn(param, (v, k, a) => {
    if (_.isObject(v)) {
      preprocess(v, config)
    }
    if (k[0] === '$') {
      let p
      _.forOwn(v, (_v, _k, _a) => {
        p = calc(k, _v, config)
        if (!_.isNull(p)) a[_k] = p
      })
      if (p) delete a[k]
    } else if (k === '_id') {
      a[k] = objectId(v)
    } else if (k === '__pwd') {
      a[k] = hashSync(v, config.bcrypt.cost)
    }
  })
}

export default function (r: Request): Observable<Request> {
  preprocess(r.nq.params, r.config)
  return Observable.of(r)
}
