# EduGenius - Firebase Authentication Setup

This project has been configured to use Firebase Authentication with Google Sign-In. Follow these steps to set up Firebase authentication for this project:

## Frontend Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)

2. Add a web app to your Firebase project
   - Click on "Add app" and select the web platform
   - Register the app with a nickname (e.g., "EduGenius Web")
   - Copy the Firebase configuration

3. Update the frontend environment variables
   - Open `frontend/.env` and replace the placeholder values with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Enable Google Sign-In in Firebase
   - In the Firebase Console, go to Authentication > Sign-in method
   - Enable Google as a sign-in provider
   - Configure the OAuth consent screen if prompted

## Backend Setup

1. Generate a Firebase Admin SDK service account key
   - In the Firebase Console, go to Project settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the `backend` directory
   - Alternatively, you can set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the JSON content

2. Update the backend environment variables
   - Open `backend/.env` and update the Firebase configuration:
   ```
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   ```

## Running the Application

1. Install dependencies
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Start the backend server
   ```
   cd backend && npm start
   ```

3. Start the frontend development server
   ```
   cd frontend && npm start
   ```

4. Access the application at http://localhost:3001

## Notes

- The application now uses Firebase Authentication with Google Sign-In instead of JWT
- User registration is no longer required as users can sign in directly with their Google accounts
- The backend still maintains a user database to store additional user information