# PGI-IA - Centre Culturel et Artistique Kahnawake

Progiciel de Gestion Intégré avec Intelligence Artificielle pour la gestion du projet Cultural Art Center Kahnawake.

## Features

- **Document Management**: Import and organize 280+ PDF documents across 9 categories (Architecture, Civil, Electrical, Mechanical, Structure, Landscape, Scenography, Food-Services, AV-Equipment)
- **AI-Powered Search**: Intelligent search across all documents, tasks, and annotations
- **Task Management**: Kanban board with task tracking, priorities, and deadlines
- **Project Timeline**: Visual timeline with milestones and deadlines
- **Analytics Dashboard**: Real-time project statistics and insights
- **Team Management**: Organize teams and track members

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pgi-ai.git
cd pgi-ai

# Install dependencies
npm install

# Set up the database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Project Structure

```
pgi-ai/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── documents/     # Document management pages
│   │   ├── tasks/         # Task management pages
│   │   └── ...
│   ├── components/        # React components
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   └── ui/            # UI primitives (Button, Card, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and Prisma client
│   └── types/             # TypeScript type definitions
└── public/
    └── plans/             # Uploaded PDF documents
```

## API Endpoints

- `GET/POST /api/projects` - List/Create projects
- `GET/PATCH/DELETE /api/projects/[id]` - Project operations
- `GET/POST /api/documents` - List/Upload documents
- `GET/PATCH/DELETE /api/documents/[id]` - Document operations
- `POST /api/import` - Bulk import documents from directory
- `GET/POST /api/tasks` - List/Create tasks
- `GET/PATCH/DELETE /api/tasks/[id]` - Task operations
- `GET /api/search?q=query` - AI-powered search
- `GET /api/stats` - Dashboard statistics
- `GET/POST /api/milestones` - Milestone management
- `GET/POST/PATCH /api/notifications` - Notifications

## Deployment

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/pgi-ai)

The project includes a `netlify.toml` configuration for easy deployment.

## License

MIT
