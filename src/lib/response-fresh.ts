import { Request } from '../nepdb.d';
import _ = require('lodash');
import httpStatus = require('http-status');
var fresh = require('fresh');
var etag = require('etag');

export = function(r: Request): void {
  let { req, res, result } = r;
  if (fresh(req.headers, { etag: etag(JSON.stringify(result)) })) {
    r.status = httpStatus.NO_CONTENT;
    r.result = undefined;
  }
}
