# Electronic Business Card System

This is a Next.js application used as a digital business card platform powered by Google Sheets. Make sharing easier!

## Setup

1. **Google Sheets**:
   - Create a Google Sheet.
   - Tab 1: `Internal_Sales` (Headers: `id`, `name`, `title`, `company`, `phone`, `email`, `linkedin`)
   - Tab 2: `User_Cards` (Headers: `id`, `name`, `title`, `company`, `phone`, `email`)
   - Share the sheet with your Service Account Email as Editor.

2. **Environment Variables**:
   - Ensure `.env.local` exists and contains:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `GOOGLE_SHEET_ID`

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access**:
   - Internal Card: `http://localhost:3000/c/YOUR_ID`
   - Create Card: `http://localhost:3000/create`
   - User Card: `http://localhost:3000/user/YOUR_GENERATED_ID`
