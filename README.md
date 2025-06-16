# Quiziac - AI-Powered Learning Platform

## 🌟 Features

### AI-Powered Quiz Generation

- Create quizzes on any topic using AI
- Customize difficulty levels (Easy, Medium, Hard)
- Adjust number of questions (3-15)
- Get detailed explanations for each question

### Interactive Quiz Experience

- Real-time progress tracking
- Timer for each quiz attempt
- Immediate feedback on answers
- Detailed explanations for incorrect answers
- Ability to review and navigate between questions

### Comprehensive Review System

- Detailed performance analytics
- Question-by-question review
- Related topics exploration
- AI-powered learning assistant for additional help
- Historical performance tracking

### User-Friendly Interface

- Modern, responsive design
- Dark/Light mode support
- Intuitive navigation
- Beautiful gradients and animations
- Mobile-friendly layout

## 🚀 Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **UI Components**: Custom components with Tailwind CSS
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## 🛠️ Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/quiziac.git
cd quiziac
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
quiziac/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── history/           # Quiz history page
│   └── review/            # Quiz review page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── quiz/             # Quiz-related components
├── lib/                  # Utility functions and configurations
└── public/              # Static assets
```
