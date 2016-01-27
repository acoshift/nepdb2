import { Request } from '../nepdb.d'

const alias = {
  c: 'create',
  r: 'read',
  u: 'update',
  d: 'delete',
  q: 'query',
  e: 'restore',
  n: 'count',
  l: 'list',
  ln: 'login',
  lo: 'logout',
  ui: 'user',
  ur: 'role',
}

export default function (r: Request): void {
  if (r.nq.method === '') return
  let m = alias[r.nq.method]
  if (m) r.nq.method = m
}
