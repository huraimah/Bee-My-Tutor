const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');
require('dotenv').config();

// Initialize Firebase Admin with Storage
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'edugenius-c3087.appspot.com'
});

module.exports = admin;
