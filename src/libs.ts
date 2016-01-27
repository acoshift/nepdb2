import cors from './lib/cors'
import db from './lib/db'
import ns from './lib/ns'
import nq from './lib/nq'
import log from './lib/log'
import alias from './lib/alias'
import token from './lib/token'
import op from './lib/op'
import responseFilter from './lib/response-filter'
import user from './lib/user'
import role from './lib/role'
import preprocess from './lib/preprocess'
import requestFilter from './lib/request-filter'
import responseFresh from './lib/response-fresh'

export default {
  cors: cors,
  db: db,
  ns: ns,
  nq: nq,
  log: log,
  alias: alias,
  token: token,
  op: op,
  responseFilter: responseFilter,
  user: user,
  role: role,
  preprocess: preprocess,
  requestFilter: requestFilter,
  responseFresh: responseFresh,
}
