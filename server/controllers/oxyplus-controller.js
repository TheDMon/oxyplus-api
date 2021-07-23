/* eslint-disable no-unused-vars */
const OxyplusService = require('../services/oxyplus-service');
const CommonUtil = require('../utils/common-util');
const _ = require('underscore');

// create user
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

  OxyplusService.create(userDocument).then((data) => {
    res.send(data);
  });
};

// update user
exports.updateUser = (req, res) => {
  console.log('req.body._id', req.body._id);
  OxyplusService.findDocumentById(req.body._id)
    .then((user) => {
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.mobile = req.body.mobile;
      user.email = req.body.email;
      user.address = req.body.address;
      user.role = req.body.role;
      user.quantity = req.body.quantity;

      OxyplusService.create(user).then((data) => {
        res.send(data);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getDocumentsByType = (req, res) => {
  console.log(req.params.type);
  OxyplusService.findByDocType(req.params.type).then((data) => res.send(data));
};

exports.getUserByEmail = (req, res) => {
  const selectorQuery = {
    email: req.params.email,
  };

  OxyplusService.findDocumentsBy(selectorQuery).then((data) => res.json(data));
};

exports.findNearByDonors = (req, res) => {
  const userId = req.params.userId;
  const distance = req.query.distance;

  const selectorQuery = {
    doctype: 'user',
    role: {
      name: { $ne: 'Recipient' },
    },
    quantity: { $gt: 0 },
  };

  OxyplusService.findDocumentsBy(selectorQuery).then((donors) => {
    OxyplusService.findDocumentById(userId).then((user) => {
      donors.forEach((donor) => {
        try {
          if (
            user.address.location !== undefined &&
            donor.address.location !== undefined
          ) {
            donor.distance = CommonUtil.haversine_distance(
              user.address.location,
              donor.address.location,
            );
          }
        } catch (error) {
          throw new Error(error);
        }
      });

      const filteredDonors = distance
        ? donors.filter((x) => x.distance <= distance)
        : donors;

      // need to sort by distance;
      _.sortBy(filteredDonors, function(donor) { return donor.distance; });

      res.json(filteredDonors);
    });
  });
};
