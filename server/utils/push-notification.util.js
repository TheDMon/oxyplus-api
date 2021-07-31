/* eslint-disable max-len */
const OxyplusService = require('../services/oxyplus-service');
const CommonUtil = require('./common-util');
const webpush = require('web-push');

const vapidKeys = {
  publicKey:
    'BHDNHLflG0CSxnKyC71y-9ZhJSn4Gfht1WSpvFLFtnIJ9BTdcSQ7e2F_wT1Dx3EW0MqhUdhoylcSJ69VGFMizmc',
  privateKey: 'Ku-5vraCzAt8OyolIs69hmSsTkcqiRuII6OW2J-pIjI',
};

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

exports.sendNewRequestNotificaiton = (request) => {
  console.log('request======>', request);

  const notificationPayload = {
    notification: {
      title: 'Angular News',
      body: 'Newsletter Available!',
      icon: 'assets/main-page-logo-small-hat.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: 'explore',
          title: 'Go to the site',
        },
      ],
    },
  };

  const selectorQuery = {
    doctype: 'user',
    role: {
      name: { $ne: 'Recipient' },
    },
    subscriptionDetails: {
      $exists: true,
    },
    quantity: { $gt: 0 },
  };

  OxyplusService.findDocumentsBy(selectorQuery).then((donors) => {
    donors.forEach((donor) => {
      try {
        if (
          request.location.position !== undefined &&
          donor.location.position !== undefined
        ) {
          donor.distance = CommonUtil.haversine_distance(
            request.location.position,
            donor.location.position,
          );
        }
      } catch (error) {
        throw new Error(error);
      }
    });

    // filter out based on distance subscribed by the donor
    const filteredDonors = donors.filter(
      (x) => x.distance <= x.subscriptionDetails.distance,
    );

    // send webpush notificaiton to each donor
    filteredDonors.forEach((donor) => {
      console.log('===========++++++++++++++>', donor.subscriptionDetails.subscription);
      webpush
        .sendNotification(
          donor.subscriptionDetails.subscription,
          JSON.stringify(notificationPayload),
        )
        .then(() => console.log('notification sent!'))
        .catch((err) => console.error(err));
    });
  });
};
