import { verifyJWTToken } from '../libs/auth'

export function verifyJWT_MW(req, res, next)
{
  const authHeader = req.headers['authorization'];
  const token = authHeader;
  if (token == null) return res.sendStatus(401);
  verifyJWTToken(token)
    .then((decodedToken) =>
    {
      req.user = decodedToken.data
      next();
    })
    .catch(() =>
    {
      res.status(400)
        .json({message: "Invalid auth token provided."})
    })
}