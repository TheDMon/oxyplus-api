/* eslint-disable max-len */
const OxyplusService = require('../services/oxyplus-service');
const CommonUtil = require('../utils/common-util');
const _ = require('underscore');

// create request
exports.createRequest = (req, res) => {
  console.log('In controller - createUser');
  const userDocument = {
    doctype: 'Request',
    submittedBy: req.body.submittedBy,
    submittedOn: new Date(),
    requester: req.body.requester,
    contact: req.body.contact,
    email: req.body.email,
    location: req.body.location,
    requestStatus: req.body.requestStatus,
  };

  OxyplusService.create(userDocument).then((data) => {
    res.status(200).json(data);
  });
};

// update reqeust
exports.updateRequest = (req, res) => {
  OxyplusService.findDocumentById(req.body._id)
    .then((item) => {
      console.log('response', item);
      item.updatedBy = req.body.updatedBy;
      item.updatedOn = new Date();
      item.requestStatus = req.body.requestStatus;
      item.followUpRequired = req.body.followUpRequired;
      item.assignedTo = req.body.assignedTo;

      OxyplusService.create(item).then((data) => {
        // if status is resolved,
        // if followRequireFlag = true, decrease quantity, else increase by one
        if (item.requestStatus.desc === 'Resolved'){
          OxyplusService.findDocumentById(item.assignedTo._id).then((user) => {
            user.quantity = item.followUpRequired ? user.quantity - 1 : user.quantity + 1;
            OxyplusService.create(user).then((data) => {});
          });
        }

        res.status(200).json(data);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.hasActiveRequest = (req, res) => {
  const user_id = req.params.user_id;

  const selector = {
    doctype: 'Request',
    submittedBy: {
      _id: user_id,
    },
    requestStatus: {
      $or: [
        {
          desc: { $eq: 'Submitted' },
        },
        {
          desc: { $eq: 'Processing' },
        },
      ],
    },
  };

  OxyplusService.findDocumentsBy(selector).then((data) => res.json(data));
};

exports.getRequestsByStatus = (req, res) => {
  const reqStatus = req.params.status;

  const selector = {
    doctype: 'Request',
    requestStatus: {
      desc: { $eq: reqStatus },
    },
  };

  OxyplusService.findDocumentsBy(selector).then((data) => res.json(data));
};

exports.findMyRequests = (req, res) => {
  const myUserId = req.params.userId;

  const selector = {
    doctype: 'Request',
    submittedBy: {
      _id: { $eq: myUserId },
    },
  };

  OxyplusService.findDocumentsBy(selector).then((data) => res.json(data));
};

exports.findAssignedRequests = (req, res) => {
  const myUserId = req.params.userId;

  const selector = {
    doctype: 'Request',
    assignedTo: { _id: myUserId },
  };

  OxyplusService.findDocumentsBy(selector).then((requests) => {
    OxyplusService.findDocumentById(myUserId).then((user) => {
      requests.forEach((request) => {
        try {
          if (
            user.location.position !== undefined &&
            request.location.position !== undefined
          ) {
            request.distance = CommonUtil.haversine_distance(
              user.location.position,
              request.location.position,
            );
          }
        } catch (error) {
          throw new Error(error);
        }
      });
      res.json(requests);
    });
  });
};

exports.findNearBySubmittedRequests = (req, res) => {
  const myUserId = req.params.userId;
  const distance = req.query.distance;

  const selector = {
    doctype: 'Request',
    requestStatus: {
      desc: { $eq: 'Submitted' },
    },
  };

  OxyplusService.findDocumentsBy(selector).then((requests) => {
    OxyplusService.findDocumentById(myUserId).then((user) => {
      requests.forEach((request) => {
        try {
          if (
            user.location.position !== undefined &&
            request.location.position !== undefined
          ) {
            request.distance = CommonUtil.haversine_distance(
              user.location.position,
              request.location.position,
            );
          }
        } catch (error) {
          throw new Error(error);
        }
      });

      const filteredRequests = distance
        ? requests.filter((x) => x.distance <= distance)
        : requests;

      // need to sort by distance;
      const sortedData = _.sortBy(filteredRequests, function(request) {
        return request.distance;
      });

      res.json(sortedData);
    });
  });
};
