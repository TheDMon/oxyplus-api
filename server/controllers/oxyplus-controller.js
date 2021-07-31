/* eslint-disable no-unused-vars */
const OxyplusService = require('../services/oxyplus-service');
const CommonUtil = require('../utils/common-util');
const _ = require('underscore');

// create user
exports.createUser = (req, res) => {
  console.log('In controller - createUser');
  const userDocument = {
    doctype: 'user',
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    location: req.body.location,
    role: req.body.role,
  };

  OxyplusService.create(userDocument).then((data) => {
    res.json(data);
  });
};

// update user
exports.updateUser = (req, res) => {
  console.log('req.body._id', req.body._id);
  OxyplusService.findDocumentById(req.body._id)
    .then((user) => {
      user.name = req.body.name;
      user.mobile = req.body.mobile;
      user.email = req.body.email;
      user.location = req.body.location;
      user.role = req.body.role;
      user.quantity = req.body.quantity;
      user.subscriptionDetails = req.body.subscriptionDetails;

      OxyplusService.create(user).then((data) => {
        res.status(200).json(data);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({text: 'Something went wrong', errorDetails: err});
    });
};

exports.getDocumentsByType = (req, res) => {
  console.log(req.params.type);
  OxyplusService.findByDocType(req.params.type).then((data) => res.json(data));
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
            user.location.position !== undefined &&
            donor.location.position !== undefined
          ) {
            donor.distance = CommonUtil.haversine_distance(
              user.location.position,
              donor.location.position,
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
      const sortedData = _.sortBy(filteredDonors, function(donor) {
        return donor.distance;
      });

      res.status(200).json(sortedData);
    });
  });
};
