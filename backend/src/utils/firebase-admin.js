const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with service account
// You need to download the service account key from Firebase console
// and save it as serviceAccountKey.json in the backend directory
// or use environment variables
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;