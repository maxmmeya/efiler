# E-Filing System

A comprehensive e-filing system built with Spring Boot 3.6 (Java 17) and Next.js 16, featuring document uploads, dynamic forms, multi-level approval workflows, digital signatures, and granular role-based access control.

## Features

### Core Features
- **User Management**: External institutional users and back-office users with granular role and permission-based access control
- **Document Management**: Upload, store, and manage documents with checksum verification
- **Dynamic Forms**: Create and manage dynamic forms with JSON schema configuration
- **Multi-Level Approval Workflow**: Configurable approval steps with role-based approvers
- **Digital Signatures**: PDF document signing with digital certificates
- **Notifications**: Multi-channel notifications (Email, SMS, Push, In-App) for submission updates
- **Real-time Updates**: Track document and approval status in real-time

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Secure document storage with checksums
- Digital signature verification

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL (with H2 for development)
- **Security**: Spring Security + JWT
- **Storage**: Local filesystem or AWS S3
- **Email**: Spring Mail (SMTP)
- **SMS**: Twilio
- **Digital Signatures**: Apache PDFBox

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Project Structure

```
efiler/
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/efiling/
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── domain/entity/   # JPA entities
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── security/        # Security configuration
│   │   │   │   ├── service/         # Business logic
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.yml  # Application configuration
│   │   └── test/
│   └── pom.xml
│
└── frontend/                 # Next.js application
    ├── src/
    │   ├── app/                     # App router pages
    │   │   ├── portal/              # External user portal
    │   │   ├── backoffice/          # Back office portal
    │   │   ├── admin/               # Admin portal
    │   │   └── login/               # Authentication
    │   ├── components/              # React components
    │   └── lib/                     # Utilities and API clients
    └── package.json
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (or use H2 for development)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Configure database** (edit `src/main/resources/application.yml`):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/efiling_db
       username: postgres
       password: your_password
   ```

3. **Set environment variables**:
   ```bash
   export JWT_SECRET=your-256-bit-secret-key-change-in-production
   export MAIL_USERNAME=your-email@gmail.com
   export MAIL_PASSWORD=your-app-password
   ```

4. **Create uploads directory**:
   ```bash
   mkdir -p uploads
   ```

5. **Build and run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start at `http://localhost:8080/api`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The frontend will start at `http://localhost:3000`

## Default Credentials

The system needs to be initialized with default roles and an admin user. You can do this by:

1. **Create roles and permissions** via database or admin API
2. **Default roles**:
   - `ADMINISTRATOR` - Full system access
   - `BACK_OFFICE_USER` - Review and approve submissions
   - `EXTERNAL_USER` - Submit documents and forms

3. **Create admin user** via signup endpoint with `ADMINISTRATOR` role

## API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### Document Endpoints
- `POST /documents/upload` - Upload document
- `GET /documents/{id}` - Get document details
- `GET /documents/{id}/download` - Download document
- `GET /documents/my-documents` - Get user's documents
- `DELETE /documents/{id}` - Delete document

### Form Endpoints
- `GET /forms/public/active` - Get active forms
- `GET /forms/{id}` - Get form by ID
- `POST /forms/manage` - Create form (Admin only)
- `POST /forms/{id}/submit` - Submit form
- `GET /forms/submissions/my-submissions` - Get user's submissions

### Approval Endpoints
- `GET /approvals/pending` - Get pending approvals for user
- `POST /approvals/{id}/action` - Process approval (approve/reject)

### Signature Endpoints
- `POST /signatures/sign/{documentId}` - Sign document
- `GET /signatures/verify/{signatureId}` - Verify signature

## Configuration

### Email Configuration
Configure SMTP settings in `application.yml`:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
```

### SMS Configuration
Configure Twilio in `application.yml`:
```yaml
app:
  notification:
    sms:
      enabled: true
      twilio:
        account-sid: ${TWILIO_ACCOUNT_SID}
        auth-token: ${TWILIO_AUTH_TOKEN}
        phone-number: ${TWILIO_PHONE_NUMBER}
```

### Storage Configuration
Choose between local or S3 storage:
```yaml
app:
  storage:
    type: local  # or s3
    local:
      path: ./uploads
    s3:
      bucket: efiling-documents
      region: us-east-1
```

## Deployment

### Backend Deployment

1. **Build JAR**:
   ```bash
   mvn clean package
   ```

2. **Run with production profile**:
   ```bash
   java -jar target/efiling-system-1.0.0.jar --spring.profiles.active=prod
   ```

### Frontend Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## Features Overview

### For External Users
- Register and login
- Upload documents
- Fill dynamic forms
- Submit for approval
- Track submission status
- Receive notifications

### For Back Office Users
- Review submissions
- Approve or reject at each step
- Add comments
- Digitally sign approved documents
- View approval history

### For Administrators
- Manage users and roles
- Create dynamic forms
- Configure approval workflows
- Manage permissions
- View system analytics

## Security Considerations

1. **Change default JWT secret** in production
2. **Use HTTPS** in production
3. **Configure CORS** properly
4. **Secure database** with strong credentials
5. **Enable rate limiting** to prevent abuse
6. **Regular security audits**
7. **Keep dependencies updated**

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.