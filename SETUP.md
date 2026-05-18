# VoxVocab Project Setup

Welcome to the VoxVocab project. Follow these steps to get the environment up and running.

## Prerequisites
- Node.js 18+
- npm or pnpm
- A Supabase account

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vox-vocab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your Supabase connection strings and Gemini API Key.

4. **Initialize Database:**
   - Supabase requires specific connection settings. Use the non-pooling URL for migrations and the pooling URL for the application.
   - Run migrations (ensure your `.env` uses `DATABASE_URL_NON_POOLING` for this command):
     ```bash
     DATABASE_URL=$DATABASE_URL_NON_POOLING npx prisma migrate dev --name init
     ```
   - For running the application, ensure `DATABASE_URL` is set to the pooling string (port 6543) in your `.env`.

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

6. **Access:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.
