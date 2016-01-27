import { Request } from '../nepdb.d'
import * as _ from 'lodash'

export default function (r: Request): void {
  r.ns = _(r.req.path.split('/')).filter(x => x !== '').join('.')
}
