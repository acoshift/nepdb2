import { ObjectID } from 'mongodb';

export function decode(input: string): string {
  return input ? new Buffer(input, 'base64').toString() : null;
}

export function objectId(id: string): ObjectID {
  try {
    return ObjectID.createFromHexString(id);
  } catch (e) {
    return null;
  }
}

export function json(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    return {};
  }
}
