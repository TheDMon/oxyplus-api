const OxyplusService = require('../services/oxyplus-service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_TOKEN_KEY = 'iaduaiduasidasudia';

// register
exports.registerUser = async(req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(400).json({ message: 'All input is required' });
  }

  // check if account already present with such email
  const querySelector = {
    doctype: 'account',
    email: email,
  };

  const encriptedPassword = await bcrypt.hash(password, 8);
  console.log(encriptedPassword);

  OxyplusService.findDocumentsBy(querySelector).then((data) => {
    if (data.length > 0) {
      res.status(404).json({ message: 'account already present' });
    } else {
      const account = {
        doctype: 'account',
        email: email,
        password: encriptedPassword,
      };

      OxyplusService.create(account).then((data) => {
        res.status(200).json(data);
      });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(400).json({ message: 'All input is required' });
  }

  const selector = {
    doctype: 'account',
    email: email,
  };

  OxyplusService.findDocumentsBy(selector)
    .then((accounts) => {
      if (accounts.length > 0) {
        // account present
        bcrypt.compare(password, accounts[0].password, (err, result) => {
          if (err) {
            return res
              .status(404)
              .json({ message: 'Something went wrong. ' + err });
          }

          if (result) {
            // generate jwt
            const token = jwt.sign(
              { userId: accounts[0]._id, email },
              JWT_TOKEN_KEY,
            );

            res
              .status(201)
              .json({ accessToken: token, message: 'Login success!' });
          } else {
            res.status(401).json({ message: 'Incorrect password' });
          }
        });
      } else {
        res.status(404).json({ message: 'Account is not present' });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.authenticateToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token){
    return res.status(403).send('Auth token is required for authentication');
  }

  try {
    const decoded = jwt.verify(token, JWT_TOKEN_KEY);
    console.log(decoded);
  } catch (err){
    return res.status(401).send('Invalid token');
  }

  return next();
};
