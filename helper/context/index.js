const jwt = require('jsonwebtoken');
const {decode} = require('punycode');
const User = require('../../database/models/user.js');

module.exports.verifyUser = async (req) => {
  try {
    req.email = null;
    req.loggedInUserId = null;
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
      const token = bearerHeader.split(' ')[1];
      console.log(token);
      const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';

      // const tokenDecodablePart = token.split('.')[1];
      // const decoded = Buffer.from(tokenDecodablePart, 'base64').toString();
      // req.email = decoded.email;

      const payload = jwt.verify(token, secret);
      console.log(payload);
      req.email = payload.email;
      const user = await User.findOne({email: payload.email});

      req.loggedInUserId = user.id;
      console.log(req.loggedInUserId);
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};
