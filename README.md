# AI Smart Form Builder

AI Smart Form Builder is a full-stack application that generates dynamic forms from a natural-language prompt, renders them instantly in the browser, and supports email-based distribution and response delivery.

The project includes:
- A React + TypeScript frontend for creating, previewing, sharing, and distributing forms.
- A Node.js + Express backend that generates schemas with OpenAI and sends emails through Nodemailer.

## Key Features

- Generate form schema from free-text prompt
- Live form preview before distribution
- Shareable URL containing the generated schema
- Submit form responses directly from shared form page
- Distribute form link to multiple recipients by email
- Input validation for target email and mailing lists

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest + ESLint

### Backend
- Node.js
- Express 5
- OpenAI SDK
- Nodemailer
- Jest

## Project Structure

```text
ai-smart-form-builder/
  backend/
    src/
      config/
      constants/
      controllers/
      middleware/
      routes/
      services/
      utils/
      validators/
    tests/
    server.js
  frontend/
    src/
      components/
      context/
      config/
      shared/
      types/
```

## Prerequisites

- Node.js 18+
- npm 9+
- OpenAI API key
- Gmail account or SMTP credentials compatible with current Nodemailer config

## Environment Variables

Create a .env file in the backend folder:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

Optional frontend variable (in frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If VITE_API_BASE_URL is not set, the frontend uses:
- Development: http://localhost:5000/api
- Production: https://my-ai-form-backend.onrender.com/api

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running Locally

Start backend:

```bash
cd backend
npm run dev
```

Start frontend (new terminal):

```bash
cd frontend
npm run dev
```

Open the app at http://localhost:5173

## Available Scripts

### Backend

- npm run dev: Start API server
- npm start: Start API server
- npm test: Run Jest tests
- npm run test:watch: Run Jest in watch mode

### Frontend

- npm run dev: Start Vite dev server
- npm run build: Build production bundle
- npm run preview: Preview production build
- npm run lint: Run ESLint
- npm run test: Run Vitest tests

## API Endpoints

Base URL: /api

- POST /generate-form
  - Body: { prompt, targetEmail }
  - Returns generated form schema

- POST /submit-form
  - Body: { targetEmail, submittedData }
  - Sends submitted form data to target email

- POST /distribute-form
  - Body: { formLink, mailingList }
  - Sends form link to recipient emails and returns distribution summary

## Testing

Backend tests:

```bash
cd backend
npm test
```

Frontend tests:

```bash
cd frontend
npm test
```

## Deployment Notes

- Set backend environment variables in your hosting platform.
- Set CORS_ORIGINS to include your frontend domain.
- Set frontend VITE_API_BASE_URL to your deployed backend URL ending with /api.
- Ensure email provider credentials are production-safe and rotated regularly.

## Troubleshooting

- OpenAI generation fails:
  - Verify OPENAI_API_KEY is set and valid.

- Email sending fails:
  - Verify EMAIL_USER and EMAIL_PASS.
  - For Gmail, use an App Password and ensure account security settings allow SMTP access.

- CORS errors in browser:
  - Add your frontend origin to CORS_ORIGINS.

## Notes for Contributors

- Frontend user-facing text is written in Hebrew by project convention.
- Keep code comments in English and concise.
- Preserve the existing frontend and backend folder separation.
