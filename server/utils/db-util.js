/* eslint-disable no-undef */
const Cloudant = require('@cloudant/cloudant');

const vcap = require('../config/vcap-local.json');

const dbName = 'oxyplus';

exports.dbCloudantConnect = () => {
  return new Promise((resolve, reject) => {
        Cloudant({  // eslint-disable-line
      url: vcap.services.cloudantNoSQLDB.credentials.cloudant_url,
    }, (err, cloudant) => {
      if (err) {
        console.log('Connect failure: ' + err.message + ' for Cloudant DB: ' +
                dbName);
        reject(err);
      } else {
        let db = cloudant.use(dbName);
        console.log('Connect success! Connected to DB: ' + dbName);
        resolve(db);
      }
    });
  });
};
