/* eslint-disable max-len */
const OxyplusService = require('../services/oxyplus-service');

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
    res.send(data);
  });
};

// update reqeust
exports.updateRequest = (req, res) => {
  console.log('req.body._id', req.body._id);
  OxyplusService.findDocumentById(req.body._id)
    .then((item) => {
      console.log('response', item);
      item.updatedBy = req.body.updatedBy;
      item.updatedOn = new Date();
      item.requestStatus = req.body.requestStatus;
      item.followUpRequired = req.body.followUpRequired;
      item.assignedTo = req.body.assignedTo;

      OxyplusService.create(item).then((data) => {
        res.send(data);
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

  OxyplusService.findDocumentsBy(selector).then((data) => res.send(data));
};

exports.getRequestsByStatus = (req, res) => {
  const reqStatus = req.params.status;

  const selector = {
    doctype: 'Request',
    requestStatus: {
      desc: { $eq: reqStatus },
    },
  };

  OxyplusService.findDocumentsBy(selector).then((data) => res.send(data));
};

exports.findMyRequests = (req, res) => {
  const myUserId = req.params.userId;

  const selector = {
    doctype: 'Request',
    submittedBy: {
      _id: { $eq: myUserId },
    },
  };

  OxyplusService.findDocumentsBy(selector).then((data) => res.send(data));
};

exports.findAssignedRequests = (req, res) => {
  const myUserId = req.params.userId;

  const selector = {
    doctype: 'Request',
    $or: [
      {
        assignedTo: myUserId,
      },
      {
        requestStatus: {
          desc: { $eq: 'Submitted' },
        },
      },
    ],
  };

  OxyplusService.findDocumentsBy(selector).then((requests) => {
    OxyplusService.findDocumentById(myUserId).then((user) => {
      requests.forEach((request) => {
        try {
          if (user.address.location !== undefined && request.location.location !== undefined){
            request.distance = haversine_distance(
              user.address.location,
              request.location.location,
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

// calculates distance between two points on map
function haversine_distance(origin, destination) {
  if (!(origin.lat && origin.lng && destination.lat && destination.lng)){
    return;
  }

  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = origin.lat * (Math.PI / 180); // Convert degrees to radians
  var rlat2 = destination.lat * (Math.PI / 180); // Convert degrees to radians
  var difflat = rlat2 - rlat1; // Radian difference (latitudes)
  var difflon =
    (destination.lng - origin.lng) * (Math.PI / 180); // Radian difference (longitudes)

  var d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2),
      ),
    );
  // 1 mi = 1.609344 km
  return d * 1.609344;
}
