import { Request } from '../nepdb.d'
import { Observable } from 'rxjs'
import { reject } from '../utils'
import { NOT_IMPLEMENTED } from 'http-status'

// ops import
import create from './op/create'
import read from './op/read'
import update from './op/update'
import delete1 from './op/delete'
import query from './op/query'
import restore from './op/restore'
import count from './op/count'
import list from './op/list'
import login from './op/login'
import user from './op/user'

const ops = {
  create: create,
  read: read,
  update: update,
  delete: delete1,
  query: query,
  restore: restore,
  count: count,
  list: list,
  login: login,
  user: user,
}

export default function (r: Request): Observable<Request> {
  let op = ops[r.nq.method]
  if (op) return op(r)
  return Observable.throw(reject(r, NOT_IMPLEMENTED))
}
