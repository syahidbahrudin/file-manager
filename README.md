# Documents Management System

A full-stack Documents Management System built with Next.js (frontend) and Node.js/Express (backend), using MySQL as the database and Drizzle ORM for database operations.

## Features

- ✅ Add and view documents
- ✅ **File upload with S3-compatible storage (MinIO)**
- ✅ **File download functionality**
- ✅ Add and view folders
- ✅ Hierarchical folder structure
- ✅ Search across documents and folders
- ✅ Form validation
- ✅ Responsive UI with Tailwind CSS
- ✅ Type-safe with TypeScript

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **MySQL 8** - Database
- **MinIO** - S3-compatible object storage
- **AWS SDK v3** - S3 client
- **Multer** - File upload middleware
- **Zod** - Request validation

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for MySQL)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd file-manager
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials if needed (defaults should work with Docker Compose).

5. Start MySQL and MinIO using Docker Compose:
```bash
docker-compose up -d
```

6. Wait for services to be ready (about 10-15 seconds), then run the migration:
```bash
npm run db:migrate
```

7. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3001`

**Note**: MinIO will be available at:
- API: `http://localhost:9000`
- Console: `http://localhost:9001` (username: `minioadmin`, password: `minioadmin`)

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional, defaults to `http://localhost:3001`):
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
file-manager/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle schema definitions
│   │   │   ├── index.ts            # Database connection
│   │   │   └── migrate.ts          # Migration script
│   │   ├── routes/
│   │   │   ├── documents.ts        # Document routes
│   │   │   ├── folders.ts          # Folder routes
│   │   │   └── search.ts           # Search route
│   │   ├── controllers/
│   │   │   ├── documentController.ts
│   │   │   └── folderController.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   └── index.ts                # Express app entry point
│   ├── drizzle.config.ts           # Drizzle configuration
│   ├── docker-compose.yml          # MySQL Docker setup
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── DocumentTable.tsx
│   │   │   ├── DocumentForm.tsx
│   │   │   ├── FolderForm.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── page.tsx                # Main page
│   │   └── layout.tsx
│   ├── lib/
│   │   └── api.ts                  # API client functions
│   └── package.json
│
└── README.md
```

## Database Schema

### Folders Table
- `id` - Primary key (auto-increment)
- `name` - Folder name (VARCHAR 255)
- `created_by` - Creator name (VARCHAR 255)
- `created_at` - Creation timestamp
- `parent_folder_id` - Foreign key to parent folder (nullable)

### Documents Table
- `id` - Primary key (auto-increment)
- `name` - Document name (VARCHAR 255)
- `type` - Document type (VARCHAR 100)
- `size` - File size in bytes (BIGINT)
- `file_path` - Path to file in S3/MinIO storage (VARCHAR 500, nullable)
- `created_by` - Creator name (VARCHAR 255)
- `created_at` - Creation timestamp
- `parent_folder_id` - Foreign key to parent folder (nullable)

## API Endpoints

### Documents
- `GET /api/documents` - Get all documents (optional query: `folderId`)
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create a new document (metadata only)
- `POST /api/documents/upload` - Upload a file (multipart/form-data)
- `GET /api/documents/:id/download` - Download a file

### Folders
- `GET /api/folders` - Get all folders (optional query: `parentId`)
- `GET /api/folders/:id` - Get folder by ID
- `POST /api/folders` - Create a new folder

### Search
- `GET /api/search?q=query` - Search documents and folders

## Usage

1. **View Documents**: The main page displays all documents in a table format with columns for Name, Type, Size, Created By, and Date.

2. **Upload File**: Click the "Upload File" button to upload an actual file:
   - Select a file from your computer
   - Enter your name (Created By)
   - Optional folder selection
   - The file will be stored in MinIO and metadata saved to the database

3. **Add Document**: Click the "Add Document" button to add document metadata only:
   - Name (required)
   - Type (required, e.g., PDF, DOCX, TXT)
   - Size in bytes (required)
   - Created By (required)
   - Optional folder selection

4. **Download File**: Click the actions menu (three dots) on any document with a file and select "Download"

5. **Add Folder**: Click the "Add Folder" button, fill in:
   - Name (required)
   - Created By (required)
   - Optional parent folder selection

6. **Search**: Use the search bar to search across all documents and folders by name.

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=file_manager
PORT=3001

# S3/MinIO Configuration
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=file-manager
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Troubleshooting

1. **MySQL Connection Error**: Ensure Docker Compose is running and MySQL container is healthy:
   ```bash
   docker-compose ps
   ```

2. **Port Already in Use**: Change the PORT in backend `.env` or frontend port in `package.json` scripts.

3. **Database Migration Fails**: Make sure MySQL is fully started before running migrations. Wait 10-15 seconds after starting Docker Compose.

4. **CORS Errors**: Ensure the backend CORS middleware is configured correctly and the frontend API URL matches the backend port.

## License

ISC

