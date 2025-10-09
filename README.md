# Frame.io Custom Actions

Custom Actions integration for Frame.io with batch video renaming and secure share link creation.

## Features

- **Batch Video Renaming**: Automatically rename videos in a folder to sequential numbers (00, 01, 02...)
- **Secure Share Links**: Create password-protected share links with watermarks

## Project Structure

```
frameio-custom-actions/
├── backend/          # Node.js Express API
├── frontend/         # Next.js Web Application
└── package.json      # Root package scripts
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- Frame.io Account
- Frame.io Developer Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/frameio-custom-actions.git
cd frameio-custom-actions
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Frame.io token:
```env
FRAMEIO_TOKEN=fio-u-your_token_here
PORT=3001
NODE_ENV=development
```

### Running Locally

Start both frontend and backend:
```bash
npm run dev
```

Or run separately:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Test User Info
```
GET /api/test/me
```

### Batch Rename Videos
```
POST /rename-videos
```

### Create Secure Share Link
```
POST /secure-share
```

## Tech Stack

- **Backend**: Node.js, Express, Axios
- **API**: Frame.io REST API v2
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS

## Security

- Never commit `.env` files
- Rotate tokens regularly
- Use environment variables for sensitive data

## License

MIT

## Author

Your Name