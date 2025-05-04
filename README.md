# EduGenius - AI-Powered Education Platform

EduGenius is an intelligent education platform that leverages AI to personalize the learning experience. The application helps students identify their learning style, organize study materials, create personalized study plans, and test their knowledge with AI-generated quizzes.

## Features

- **Learning Style Assessment**: Discover your unique learning style (Visual, Auditory, Reading, Kinesthetic) with our AI-powered assessment.
- **Study Material Management**: Upload and organize study materials in PDF or DOCX format.
- **AI Content Analysis**: Automatically extract key points, summaries, and metadata from uploaded documents.
- **Personalized Study Plans**: Generate study plans tailored to your learning style and upcoming exam deadlines.
- **Interactive Quizzes**: Create AI-generated quizzes based on your study materials.
- **Grade Prediction**: Predict your exam performance based on quiz results and study progress.

## Tech Stack

### Backend
- Node.js
- Express.js
- Google Gemini API for AI capabilities
- Google Firebase

### Frontend
- React
- React Router
- Redux
- Axios

## Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key
- Google Firebase authenticator
- Gogle Firebase storage
- Google Firebase database

## Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/education-app.git
cd education-app
```

### Set up environment variables
Create a `.env` file in the root directory based on the `.env.example` file:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/education-app
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Install server dependencies
```bash
npm install
```

### Install client dependencies
```bash
cd client
npm install
cd ..
```

### Run the application
For development (runs both server and client):
```bash
npm run dev
```

For server only:
```bash
npm run server
```

For client only:
```bash
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/learning-style` - Save learning style assessment
- `GET /api/users/learning-style` - Get user learning style
- `GET /api/users/stats` - Get user statistics and predictions

### Study Materials
- `POST /api/study/materials` - Upload study material
- `GET /api/study/materials` - Get all user's study materials
- `GET /api/study/materials/:id` - Get a specific study material
- `DELETE /api/study/materials/:id` - Delete a study material

### Study Plans
- `POST /api/study/plans` - Generate a study plan
- `GET /api/study/plans` - Get all user's study plans
- `GET /api/study/plans/:id` - Get a specific study plan
- `PUT /api/study/plans/:id/progress` - Update study plan progress

### Quizzes
- `POST /api/quiz` - Generate a quiz
- `GET /api/quiz` - Get all user's quizzes
- `GET /api/quiz/:id` - Get a specific quiz
- `PUT /api/quiz/:id` - Edit a quiz
- `DELETE /api/quiz/:id` - Delete a quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/results` - Get all quiz results
- `GET /api/quiz/predict` - Predict exam grade

## Project Structure

```
education-app/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       ├── context/        # Context API
│       ├── pages/          # Page components
│       └── utils/          # Utility functions
├── src/                    # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── services/           # Business logic
└── server.js               # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for AI capabilities
- Material-UI for the beautiful UI components
