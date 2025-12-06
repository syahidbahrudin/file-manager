# Documents Management System

A full-stack Documents Management System built with Next.js (frontend) and Node.js/Express (backend), using MySQL as the database and Drizzle ORM for database operations. Features user authentication, file upload/download with S3-compatible storage, hierarchical folder structure, and search functionality.

## Features

- ✅ User authentication (Sign up, Login, JWT-based sessions)
- ✅ Add and view documents
- ✅ **File upload with S3-compatible storage (MinIO)**
- ✅ **File download functionality**
- ✅ Add and view folders
- ✅ Hierarchical folder structure
- ✅ Search across documents and folders
- ✅ Pagination for large datasets
- ✅ Form validation
- ✅ Responsive UI with Tailwind CSS
- ✅ Type-safe with TypeScript

## Tech Stack

### Frontend

- **Next.js 16** - React framework with server-side rendering and routing
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Hook Form** - Performant form management with minimal re-renders
- **Zod** - Schema validation for type-safe form validation
- **Radix UI** - Accessible component primitives (Dialog, Dropdown Menu)
- **Lucide React** - Modern icon library

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Minimal and flexible web framework
- **TypeScript** - Type safety and better code maintainability
- **Drizzle ORM** - Lightweight, performant TypeScript ORM with excellent type inference
- **MySQL 8** - Relational database for structured data storage
- **MinIO** - S3-compatible object storage for file management
- **AWS SDK v3** - Official AWS SDK for S3 operations (works with MinIO)
- **Multer** - Middleware for handling multipart/form-data file uploads
- **Zod** - Schema validation for request validation
- **JWT (jsonwebtoken)** - Stateless authentication tokens
- **bcryptjs** - Password hashing for secure authentication
- **CORS** - Cross-Origin Resource Sharing middleware

## Why These Services?

### **Next.js 16**

- **Server-Side Rendering (SSR)**: Improves SEO and initial page load performance
- **File-based Routing**: Intuitive routing system that matches file structure
- **API Routes**: Can handle API endpoints if needed (though we use separate backend)
- **Built-in Optimizations**: Image optimization, code splitting, and more
- **React 19 Support**: Latest React features and performance improvements

### **MySQL 8**

- **Relational Data**: Perfect for structured data like folders, documents, and users with relationships
- **ACID Compliance**: Ensures data integrity for critical operations
- **Mature Ecosystem**: Extensive tooling and community support
- **Performance**: Excellent for complex queries and joins
- **Docker Support**: Easy to containerize and deploy

### **Drizzle ORM**

- **Type Safety**: Full TypeScript support with excellent type inference
- **Lightweight**: Minimal overhead compared to heavier ORMs like Sequelize or TypeORM
- **SQL-like Syntax**: Easy to learn for developers familiar with SQL
- **Migration System**: Built-in migration generation and management
- **Performance**: Generates optimized SQL queries

### **MinIO (S3-compatible Storage)**

- **Local Development**: Run S3-compatible storage locally without AWS account
- **Production Ready**: Same API as AWS S3, easy migration to production
- **Cost Effective**: Free for development, can use AWS S3 in production
- **Scalable**: Handles large files efficiently
- **Web Console**: Built-in management UI for monitoring and debugging

### **JWT Authentication**

- **Stateless**: No server-side session storage needed
- **Scalable**: Works well with distributed systems
- **Secure**: Tokens can be signed and verified
- **Standard**: Industry-standard authentication method

### **Docker & Docker Compose**

- **Consistency**: Same environment across all developers
- **Easy Setup**: One command to start all services
- **Isolation**: Services don't interfere with local installations
- **Production-like**: Similar to production deployment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** (recommended) or **npm** - Package manager
  - Install pnpm: `npm install -g pnpm`
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
  - Required for running MySQL and MinIO services

## Complete Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd file-manager
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

#### 2.3 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# On Linux/Mac
touch .env

# On Windows
type nul > .env
```

Add the following content to `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=file_manager

# Server Configuration
PORT=3001

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# S3/MinIO Configuration
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=file-manager
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

#### 2.4 Start Docker Services (MySQL & MinIO)

Make sure Docker Desktop is running, then start the services:

```bash
docker-compose up -d
```

This will start:

- **MySQL 8** on port `3306`
- **MinIO** on ports `9000` (API) and `9001` (Console)

Wait for services to be ready (about 10-15 seconds). You can check the status:

```bash
docker-compose ps
```

Both services should show as "healthy" or "running".

#### 2.5 Verify MinIO Console (Optional)

Open your browser and navigate to:

- **MinIO Console**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin`

You can use this console to:

- View uploaded files
- Create/manage buckets
- Monitor storage usage

#### 2.6 Run Database Migrations

Initialize the database schema:

```bash
pnpm run db:migrate
# or
npm run db:migrate
```

This will:

- Create the database tables (users, folders, documents)
- Set up relationships and indexes

#### 2.7 Start the Backend Server

```bash
pnpm run dev
# or
npm run dev
```

The backend server will start on `http://localhost:3001`

You should see:

```
Server is running on port 3001
Health check: http://localhost:3001/health
```

Verify it's working:

```bash
curl http://localhost:3001/health
```

Expected response: `{"status":"ok","message":"Server is running"}`

### Step 3: Frontend Setup

#### 3.1 Open a New Terminal

Keep the backend running, and open a new terminal window/tab.

#### 3.2 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.3 Install Dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

#### 3.4 Create Environment File (Optional)

Create a `.env.local` file in the `frontend` directory:

```bash
# On Linux/Mac
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# On Windows
echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
```

Or manually create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note**: If you don't create this file, the frontend will default to `http://localhost:3001`.

#### 3.5 Start the Frontend Development Server

```bash
pnpm run dev
# or
npm run dev
```

The frontend will start on `http://localhost:3000`

You should see:

```
  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
```

### Step 4: Access the Application

1. Open your browser and navigate to: **http://localhost:3000**

2. **First Time Setup**:

   - Click "Sign Up" to create a new account
   - Enter your email and password
   - After signing up, you'll be automatically logged in

3. **Start Using the App**:
   - Upload files using the "Upload File" button
   - Create folders to organize your documents
   - Search for documents and folders
   - Download files using the action menu (three dots)

## Project Structure

```
file-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── s3.ts              # S3/MinIO client configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Authentication logic
│   │   │   ├── documentController.ts
│   │   │   ├── fileListController.ts
│   │   │   └── folderController.ts
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle schema definitions
│   │   │   ├── index.ts           # Database connection
│   │   │   └── migrate.ts         # Migration script
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication middleware
│   │   │   ├── errorHandler.ts   # Global error handling
│   │   │   ├── upload.ts          # File upload middleware (Multer)
│   │   │   └── validation.ts      # Request validation
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication routes
│   │   │   ├── documents.ts       # Document routes
│   │   │   ├── folders.ts         # Folder routes
│   │   │   ├── search.ts          # Search route
│   │   │   └── fileList.ts        # File listing route
│   │   ├── utils/
│   │   │   └── s3.ts              # S3 utility functions
│   │   └── index.ts               # Express app entry point
│   ├── drizzle.config.ts          # Drizzle configuration
│   ├── docker-compose.yml         # MySQL & MinIO Docker setup
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── document/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Document detail page
│   │   ├── page.tsx                # Main page (file list)
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── table.tsx
│   │   ├── ActionMenu.tsx          # File action menu
│   │   ├── DocumentForm.tsx        # Document creation form
│   │   ├── FileTable.tsx           # File listing table
│   │   ├── FileUploadForm.tsx      # File upload form
│   │   ├── FolderForm.tsx          # Folder creation form
│   │   ├── LoginForm.tsx           # Login form
│   │   ├── Pagination.tsx          # Pagination component
│   │   ├── SearchBar.tsx           # Search component
│   │   ├── SignupForm.tsx          # Signup form
│   │   └── ViewModal.tsx           # Document view modal
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── lib/
│   │   ├── api.ts                  # API client functions
│   │   └── utils.tsx               # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Database Schema

### Schema Design Philosophy

The database schema is designed with the following principles:

1. **Simplicity First**: The schema prioritizes clarity and ease of use over complex normalization
2. **Hierarchical Structure**: Self-referencing foreign keys enable nested folder structures
3. **Audit Trail**: Every record tracks who created it and when
4. **Flexibility**: Nullable foreign keys allow items to exist at the root level or within folders
5. **Separation of Concerns**: File storage (S3/MinIO) is separate from metadata (database)

### Tables Overview

#### Users Table

**Purpose**: Stores user authentication and profile information.

```sql
users
├── id (INT, PK, AUTO_INCREMENT)      # Unique user identifier
├── email (VARCHAR 255, UNIQUE)       # User email (login credential)
├── password (VARCHAR 255)            # Bcrypt-hashed password
├── name (VARCHAR 255)                # User's display name
└── created_at (DATETIME)             # Account creation timestamp
```

**Design Decisions**:

- **Email as UNIQUE**: Ensures one account per email, used as login identifier
- **Password VARCHAR(255)**: Bcrypt hashes are always 60 characters, but 255 provides buffer for future algorithm changes
- **Name Field**: Stores user's display name for showing "Created By" information
- **Auto-increment ID**: Simple, efficient primary key for relationships

#### Folders Table

**Purpose**: Represents organizational containers that can hold documents and other folders.

```sql
folders
├── id (INT, PK, AUTO_INCREMENT)      # Unique folder identifier
├── name (VARCHAR 255)                # Folder name
├── created_by (VARCHAR 255)          # Creator's identifier (email/name)
├── created_at (DATETIME)             # Creation timestamp
└── parent_folder_id (INT, NULLABLE)  # Self-referencing FK for hierarchy
```

**Design Decisions**:

- **Self-Referencing Foreign Key (`parent_folder_id`)**:
  - Enables unlimited nesting depth (folders within folders)
  - NULL value represents root-level folders
  - Creates a tree structure: `folder → parent_folder → parent_folder → ... → NULL`
- **`created_by` as VARCHAR (not FK)**:
  - **Current Design**: Stores creator identifier as string for simplicity
  - **Trade-off**: Easier queries (no JOIN needed), but less normalized
  - **Alternative Consideration**: Could use `user_id INT` with FK to `users.id` for better referential integrity
- **Name VARCHAR(255)**: Sufficient for most folder names, allows descriptive naming

**Hierarchical Structure Example**:

```
Root Level (parent_folder_id = NULL)
├── Documents (id: 1)
│   ├── 2024 (id: 2, parent_folder_id: 1)
│   │   ├── Q1 (id: 3, parent_folder_id: 2)
│   │   └── Q2 (id: 4, parent_folder_id: 2)
│   └── Archive (id: 5, parent_folder_id: 1)
└── Personal (id: 6)
```

#### Documents Table

**Purpose**: Stores file metadata and references to actual files in object storage.

```sql
documents
├── id (INT, PK, AUTO_INCREMENT)      # Unique document identifier
├── name (VARCHAR 255)                # Document/file name
├── type (VARCHAR 100)                # File type/extension (e.g., "PDF", "DOCX")
├── size (BIGINT)                     # File size in bytes
├── file_path (VARCHAR 500, NULLABLE) # S3/MinIO object key/path
├── created_by (VARCHAR 255)         # Creator's identifier
├── created_at (DATETIME)             # Creation timestamp
└── parent_folder_id (INT, NULLABLE)  # FK to folders (nullable for root)
```

**Design Decisions**:

- **`file_path` as VARCHAR(500)**:
  - Stores the S3/MinIO object key (e.g., `"users/123/document.pdf"`)
  - 500 characters accommodates deep folder structures in S3
  - NULLABLE: Documents can exist as metadata-only (no actual file uploaded)
- **`size` as BIGINT**:
  - Supports files up to 9,223,372,036,854,775,807 bytes (~9 exabytes)
  - Prevents integer overflow for large files
  - Stored as number for easy calculations (total size, etc.)
- **`type` VARCHAR(100)**:
  - Stores MIME type or file extension
  - Examples: "application/pdf", "image/png", "text/plain", or "PDF", "PNG"
  - Used for filtering, display icons, and validation
- **`parent_folder_id` NULLABLE**:
  - NULL = document at root level
  - NOT NULL = document inside a folder
  - Enables flexible organization without requiring a folder
- **`created_by` as VARCHAR (not FK)**:
  - Same design choice as folders table
  - Stores creator identifier for quick display
  - Trade-off: Simpler queries vs. referential integrity

### Relationships

#### Folder Hierarchy (Self-Referencing)

```
folders.parent_folder_id → folders.id
```

**Purpose**: Creates a tree structure for nested folders.

**How it works**:

- A folder can have one parent (or NULL for root)
- A folder can have many children
- Enables queries like "get all subfolders" using recursive CTEs or application logic

**Example Query Pattern**:

```sql
-- Get all folders in a specific folder
SELECT * FROM folders WHERE parent_folder_id = 1;

-- Get root-level folders
SELECT * FROM folders WHERE parent_folder_id IS NULL;
```

#### Document to Folder Relationship

```
documents.parent_folder_id → folders.id
```

**Purpose**: Associates documents with their containing folder.

**How it works**:

- A document belongs to zero or one folder
- NULL means the document is at root level
- Enables queries like "get all documents in folder X"

**Example Query Pattern**:

```sql
-- Get all documents in a folder
SELECT * FROM documents WHERE parent_folder_id = 1;

-- Get root-level documents
SELECT * FROM documents WHERE parent_folder_id IS NULL;
```

### Design Trade-offs and Considerations

#### 1. **`created_by` as VARCHAR vs. Foreign Key**

**Current Design (VARCHAR)**:

- ✅ **Pros**:
  - Simpler queries (no JOIN needed to display creator)
  - Faster reads for list views
  - Works even if user is deleted (preserves history)
- ❌ **Cons**:
  - No referential integrity (can't enforce user exists)
  - Potential data inconsistency if user email changes
  - No automatic cascade delete

**Alternative Design (Foreign Key)**:

```sql
created_by INT → users.id (FK)
```

- ✅ **Pros**:
  - Referential integrity enforced
  - Automatic updates if user changes
  - Better data consistency
- ❌ **Cons**:
  - Requires JOIN for every query
  - Deleted users cause orphaned records (or need CASCADE)

**Recommendation for Production**: Consider migrating to FK for better data integrity, especially if user management is critical.

#### 2. **File Storage Separation**

**Design**: Files stored in S3/MinIO, metadata in database.

**Why**:

- ✅ **Scalability**: Object storage handles large files better than database BLOBs
- ✅ **Performance**: Database stays lightweight, faster queries
- ✅ **Cost**: Object storage is cheaper for large files
- ✅ **CDN Integration**: Easy to serve files via CDN
- ✅ **Backup**: Separate backup strategies for data vs. files

**Trade-off**: Requires two systems, but benefits outweigh complexity.

#### 3. **Nullable Foreign Keys**

Both `parent_folder_id` fields are nullable to allow root-level items.

**Why**:

- ✅ **Flexibility**: Users can organize or leave items at root
- ✅ **User Experience**: No forced folder structure
- ✅ **Simplicity**: No need for a "root" folder entity

**Alternative**: Create a special "root" folder with `id = 0`, but nullable is cleaner.

#### 4. **No Soft Deletes**

Current design doesn't include `deleted_at` or `is_deleted` fields.

**Consideration**: For production, you might want to add:

```sql
deleted_at DATETIME NULLABLE
```

- Allows recovery of accidentally deleted items
- Maintains audit trail
- Requires filtering in queries: `WHERE deleted_at IS NULL`

### Indexing Strategy

**Recommended Indexes** (add via migrations if needed):

```sql
-- Fast folder hierarchy queries
CREATE INDEX idx_folders_parent ON folders(parent_folder_id);

-- Fast document folder queries
CREATE INDEX idx_documents_parent ON documents(parent_folder_id);

-- Fast user lookup
CREATE INDEX idx_users_email ON users(email);  -- Already unique, but explicit

-- Fast search queries
CREATE INDEX idx_documents_name ON documents(name);
CREATE INDEX idx_folders_name ON folders(name);

-- Fast user-based queries (if using FK)
-- CREATE INDEX idx_documents_created_by ON documents(created_by);
```

### Future Schema Enhancements

Consider adding for production:

1. **Soft Deletes**: `deleted_at` timestamp for recovery
2. **Updated Timestamps**: `updated_at` for tracking changes
3. **File Versioning**: Track multiple versions of same document
4. **Sharing/Permissions**: Table for sharing documents/folders with other users
5. **Tags/Labels**: Many-to-many relationship for document categorization
6. **File Metadata**: JSON column for additional file properties (dimensions, EXIF, etc.)
7. **Activity Log**: Separate table for audit trail of all actions

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  - Body: `{ email: string, password: string }`
- `POST /api/auth/login` - Login user
  - Body: `{ email: string, password: string }`
  - Returns: `{ token: string, user: { id, email } }`

### Documents

- `GET /api/documents` - Get all documents (requires auth)
  - Query params: `folderId` (optional), `page`, `limit`
- `GET /api/documents/:id` - Get document by ID (requires auth)
- `POST /api/documents` - Create document metadata (requires auth)
  - Body: `{ name, type, size, parentFolderId? }`
- `POST /api/documents/upload` - Upload a file (requires auth)
  - Form data: `file`, `parentFolderId?`
- `GET /api/documents/:id/download` - Download a file (requires auth)

### Folders

- `GET /api/folders` - Get all folders (requires auth)
  - Query params: `parentId` (optional)
- `GET /api/folders/:id` - Get folder by ID (requires auth)
- `POST /api/folders` - Create a new folder (requires auth)
  - Body: `{ name, parentFolderId? }`

### Search

- `GET /api/search?q=query` - Search documents and folders (requires auth)
  - Returns: `{ documents: [], folders: [] }`

### Files

- `GET /api/files` - Get paginated file list (requires auth)
  - Query params: `page`, `limit`, `folderId?`, `search?`

## Usage Guide

### 1. Authentication

- **Sign Up**: Create a new account with email and password
- **Login**: Sign in with your credentials
- **Session**: You'll stay logged in until you log out or the token expires

### 2. Upload Files

- Click the "Upload File" button
- Select a file from your computer
- Optionally select a folder to organize the file
- The file will be:
  - Uploaded to MinIO/S3 storage
  - Metadata saved to the database
  - Associated with your user account

### 3. Create Folders

- Click "Add Folder" button
- Enter a folder name
- Optionally select a parent folder for hierarchy
- Folders help organize your documents

### 4. View Documents

- All documents are displayed in a table
- Use pagination to navigate through large lists
- Click on a document name to view details
- Use the action menu (three dots) for:
  - Download file
  - View document
  - Delete document

### 5. Search

- Use the search bar at the top
- Search across document names and folder names
- Results update in real-time

### 6. Download Files

- Click the action menu (three dots) on any document
- Select "Download"
- The file will be downloaded to your computer

## Development Scripts

### Backend Scripts

```bash
# Development server with hot reload
pnpm run dev
# or
npm run dev

# Build for production
pnpm run build
npm run build

# Start production server
pnpm start
npm start

# Database migrations
pnpm run db:generate    # Generate migration files
pnpm run db:migrate     # Run migrations
pnpm run db:studio      # Open Drizzle Studio (database GUI)
```

### Frontend Scripts

```bash
# Development server
pnpm run dev
npm run dev

# Build for production
pnpm run build
npm run build

# Start production server
pnpm start
npm start

# Lint code
pnpm run lint
npm run lint
```

## Environment Variables

### Backend (.env)

```env
# Database Configuration
DB_HOST=localhost          # MySQL host
DB_PORT=3306               # MySQL port
DB_USER=root               # MySQL username
DB_PASSWORD=rootpassword   # MySQL password
DB_NAME=file_manager       # Database name

# Server Configuration
PORT=3001                  # Backend server port

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# S3/MinIO Configuration
S3_ENDPOINT=http://localhost:9000    # MinIO API endpoint
S3_REGION=us-east-1                  # S3 region (required by AWS SDK)
S3_ACCESS_KEY_ID=minioadmin          # MinIO access key
S3_SECRET_ACCESS_KEY=minioadmin     # MinIO secret key
S3_BUCKET_NAME=file-manager          # Bucket name for file storage
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

## Docker Services

### Starting Services

```bash
cd backend
docker-compose up -d
```

### Stopping Services

```bash
cd backend
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mysql
docker-compose logs -f minio
```

### Resetting Services (WARNING: Deletes all data)

```bash
docker-compose down -v  # Stops and removes volumes
docker-compose up -d     # Starts fresh
```

## Troubleshooting

### 1. MySQL Connection Error

**Problem**: Backend can't connect to MySQL

**Solutions**:

- Ensure Docker is running: `docker ps`
- Check MySQL container status: `docker-compose ps`
- Wait 10-15 seconds after starting Docker Compose for MySQL to initialize
- Verify MySQL is healthy: `docker-compose logs mysql`
- Check `.env` file has correct database credentials

### 2. Port Already in Use

**Problem**: Port 3000, 3001, 3306, 9000, or 9001 is already in use

**Solutions**:

- Find what's using the port:

  ```bash
  # Mac/Linux
  lsof -i :3001

  # Windows
  netstat -ano | findstr :3001
  ```

- Stop the conflicting service or change the port in:
  - Backend: `.env` file (PORT)
  - Frontend: `package.json` scripts or `.env.local`
  - Docker: `docker-compose.yml` (ports section)

### 3. Database Migration Fails

**Problem**: Migration errors or tables not created

**Solutions**:

- Ensure MySQL is fully started (wait 10-15 seconds)
- Check database exists: `docker-compose exec mysql mysql -uroot -prootpassword -e "SHOW DATABASES;"`
- Verify `.env` database credentials match `docker-compose.yml`
- Try resetting: `docker-compose down -v && docker-compose up -d`
- Check migration logs: `pnpm run db:migrate` (should show success)

### 4. MinIO Connection Error

**Problem**: Files can't be uploaded to MinIO

**Solutions**:

- Verify MinIO is running: `docker-compose ps`
- Check MinIO logs: `docker-compose logs minio`
- Access MinIO console: http://localhost:9001
- Verify bucket exists (should be created automatically on first upload)
- Check `.env` S3 configuration matches MinIO credentials

### 5. CORS Errors

**Problem**: Frontend can't connect to backend API

**Solutions**:

- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches backend port
- Check backend CORS middleware is enabled (should be in `src/index.ts`)
- Ensure both servers are running
- Check browser console for specific error messages

### 6. Authentication Errors

**Problem**: Can't login or "Invalid token" errors

**Solutions**:

- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear
- Verify JWT_SECRET is set in backend `.env`
- Check token expiration (default is 7 days)
- Try signing up again with a new account

### 7. File Upload Fails

**Problem**: Files don't upload or show errors

**Solutions**:

- Check file size limits (Multer default is usually 10MB)
- Verify MinIO is running and accessible
- Check backend logs for specific errors
- Ensure bucket exists in MinIO
- Verify file permissions

### 8. Dependencies Installation Issues

**Problem**: `pnpm install` or `npm install` fails

**Solutions**:

- Clear cache:
  ```bash
  pnpm store prune
  # or
  npm cache clean --force
  ```
- Delete `node_modules` and lock files, then reinstall:
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```
- Check Node.js version: `node --version` (should be 18+)
- Try using npm instead of pnpm (or vice versa)

## Production Deployment

### Important Considerations

1. **Change JWT_SECRET**: Use a strong, random secret key
2. **Use Real S3**: Replace MinIO with AWS S3 or compatible service
3. **Environment Variables**: Set all environment variables securely
4. **Database**: Use managed MySQL service (AWS RDS, etc.)
5. **HTTPS**: Enable SSL/TLS certificates
6. **CORS**: Configure CORS to only allow your production domain
7. **File Size Limits**: Configure appropriate limits for production
8. **Error Handling**: Set up proper error logging and monitoring

### Example Production Environment Variables

```env
# Backend
DB_HOST=your-production-db-host
DB_PASSWORD=strong-production-password
JWT_SECRET=generate-strong-random-secret-here
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-production-bucket

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```
