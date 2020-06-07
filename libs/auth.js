import jwt from 'jsonwebtoken'
import Promise from 'es6-promise';
import _ from 'lodash';
import config from '../config/index';

let newPromise = Promise.Promise;

const verifyJWTToken = (token) =>
{
  return new newPromise((resolve, reject) =>
  {
    jwt.verify(token, config.JWT_SECRET, (err, decodedToken) => 
    {
      if (err || !decodedToken)
      {
        return reject(err)
      }

      resolve(decodedToken)
    })
  })
}
export { verifyJWTToken };