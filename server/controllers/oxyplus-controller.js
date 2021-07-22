
const OxyplusService = require('../services/oxyplus-service');

// create donar
exports.createUser = (req, res) => {
  console.log('In controller - createUser');
  const userDocument = {
    doctype: 'user',
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    mobile: req.body.mobile,
    email: req.body.email,
    address: req.body.address,
    role: req.body.role,
  };

  OxyplusService.create(userDocument).then(data => {
    res.send(data);
  });
};

// update user
exports.updateUser = (req, res) => {
  console.log('req.body._id', req.body._id);
  OxyplusService.findDocumentById(req.body._id)
    .then(user => {
      console.log('response', user);
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.mobile = req.body.mobile;
      user.email = req.body.email;
      user.address = req.body.address;
      user.role = req.body.role;
      user.quantity = req.body.quantity;

      OxyplusService.create(user).then(data => {
        res.send(data);
      });
    }).catch(err => {
      console.log(err);
    });
};

exports.getDonars = (req, res) => {
  OxyplusService.getList().then(data => res.send(data));
};

exports.getDocumentsByType = (req, res) => {
  console.log(req.params.type);
  OxyplusService.findByDocType(req.params.type).then(data => res.send(data));
};

exports.getUserByEmail = (req, res) => {
  const selectorQuery = {
    email: req.params.email,
  };

  OxyplusService.findDocumentsBy(selectorQuery).then(data => res.json(data));
};

exports.findDonars = (req, res) => {
  const selectorQuery = {
    doctype: 'user',
    role: {
      name: { $ne: 'Recipient' },
    },
    quantity: { $gt: 0 },
  };

  OxyplusService.findDocumentsBy(selectorQuery).then(data => res.json(data));
};

exports.findRequests = (req, res) => {
  const selector = {
    doctype: 'Request',
    requestStatus: {
      desc: { $eq: 'Submitted' },
    },
  };

  OxyplusService.findDocumentsBy(selector).then(data => res.json(data));
};
