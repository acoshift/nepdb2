import { Request } from '../nepdb.d'
import * as _ from 'lodash'
import * as jwt from 'jsonwebtoken'
import { getTokenSecret } from '../utils'

export default function (r: Request): void {
  let req = r.req

  let token = null

  let p = req.get('authorization')
  if (p) {
    let [ m, t ] = p.split(' ')
    if (m.toLowerCase() === 'bearer' && _.isString(t) && t.trim() !== '') {
      token = t
    }
  }

  if (!token) return

  let secret = getTokenSecret(r.config, true)
  let t = null
  try {
    t = jwt.verify(token, secret, { algorithms: [ r.config.token.algorithm ] })
  } catch (e) {}

  r.token = t
}
