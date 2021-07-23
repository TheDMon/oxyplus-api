/* eslint-disable no-undef */
/* eslint-disable max-len */
const dbUtil = require('../utils/db-util');

let db;

// Initialize the DB when this module is loaded
(function getDbConnection() {
  console.log('Initializing Cloudant connection...', 'items-dao-cloudant.getDbConnection()');
  dbUtil.dbCloudantConnect().then((database) => {
    console.log('Cloudant connection initialized.', 'items-dao-cloudant.getDbConnection()');
    db = database;
  }).catch((err) => {
    console.log('Error while initializing DB: ' + err.message, 'items-dao-cloudant.getDbConnection()');
    throw err;
  });
})();

exports.create = document => {
  return new Promise((resolve, reject) => {
    db.insert(document, (err, result) => {
      if (err) {
        console.log('Error occurred: ' + err.message, 'create()');
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.getList = () => {
  return new Promise((resolve, reject) => {
    db.list((err, result) => {
      if (err) {
        console.log('Error occurred: ' + err.message, 'create()');
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

};

exports.findByDocType = (type) => {
  return new Promise((resolve, reject) => {
    // let search = `.*${type}.*`;
    db.find({
      selector: {
        doctype: type,
      },
    }, (err, documents) => {
      if (err) {
        reject(err);
      } else {
        resolve(documents.docs);
        // resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
      }
    });
  });
};

exports.findDocumentById = id => {
  return new Promise((resolve, reject) => {
    db.get(id, (err, document) => {
      if (err) {
        if (err.message === 'missing') {
          console.log(`Document id ${id} does not exist.`, 'findById()');
          resolve({ data: {}, statusCode: 404 });
        } else {
          console.log('Error occurred: ' + err.message, 'findById()');
          reject(err);
        }
      } else {
        resolve(document);
      }
    });
  });
};

exports.findDocumentsBy = (selectorQuery) => {
  return new Promise((resolve, reject) => {
    db.find({
      selector: selectorQuery,
    }, (err, documents) => {
      if (err) {
        reject(err);
      } else {
        resolve(documents.docs);
        // resolve({ data: JSON.stringify(documents.docs), statusCode: (documents.docs.length > 0) ? 200 : 404 });
      }
    });
  });
};

