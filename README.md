# Worship Hub 🎶

A beautifully crafted, modern Vue 3 application built for managing worship music libraries, scheduling Sunday setlists, and organizing musician line-ups. Featuring a sleek glassmorphism UI, integrated audio players, external PDF chord chart links, and a secure admin dashboard powered by Supabase.

## ✨ Features

- **Global Song Library:** Instantly search your entire catalog by title, key, BPM, or artist.
- **Sunday Setlist Planner:** Effortlessly build your upcoming service setlist with intuitive drag-and-drop song reordering.
- **Auto-Clearing Setlists:** Built-in logic automatically clears and resets the Sunday setlist every Monday morning, keeping your dashboard clean without any manual effort or complex cron jobs.
- **Verse of the Week:** Inspire your team with an auto-generating worship verse built right into the setlist planner.
- **Team Roster:** Interactive volunteer and musician assignments for seamless weekly coordination.
- **Secure Admin Dashboard:** Protected routes and Supabase authentication ensure only authorized leaders can modify the library and schedule.

## 🛠 Tech Stack

- **Frontend:** Vue 3 (Composition API), Vite, Vanilla CSS
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **UI/UX:** Custom dark-mode design system with rich glassmorphism effects, fluid micro-animations, and responsive layouts.

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/williamstefanus/worship-hub.git
   cd worship-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🗄 Database Schema

To set up the backend on Supabase, the following primary tables are utilized:

- `songs`: Stores song metadata (`title`, `key`, `bpm`, `audio_url`, `pdf_url`, `tags`, etc.)
- `artists`: Stores artist metadata.
- `sunday_setlist`: A single-row table tracking the upcoming week's `song_ids`, `label`, `sunday_date`, `musicians`, and `verse`.

*Ensure Row Level Security (RLS) is enabled so that public users have read-only access while authenticated admins have write access.*
