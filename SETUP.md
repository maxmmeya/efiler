# Quick Setup Guide

This guide will help you get the E-Filing System up and running quickly.

## Prerequisites Installation

### 1. Install Java 17
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# macOS (using Homebrew)
brew install openjdk@17

# Verify installation
java -version
```

### 2. Install Maven
```bash
# Ubuntu/Debian
sudo apt install maven

# macOS
brew install maven

# Verify installation
mvn -version
```

### 3. Install Node.js and npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# macOS
brew install node@18

# Verify installation
node -v
npm -v
```

### 4. Install PostgreSQL (Optional - can use H2 for development)
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
```

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd efiler
```

### 2. Database Setup (PostgreSQL)

If using PostgreSQL:
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE efiling_db;
CREATE USER efiling_user WITH PASSWORD 'efiling_password';
GRANT ALL PRIVILEGES ON DATABASE efiling_db TO efiling_user;
\q
```

For development, you can skip this and use the embedded H2 database.

### 3. Backend Setup

```bash
cd backend

# Create uploads directory
mkdir -p uploads

# Set environment variables (or create application-local.yml)
export JWT_SECRET="your-very-long-secret-key-at-least-256-bits-change-this-in-production"
export DB_USERNAME=efiling_user
export DB_PASSWORD=efiling_password

# Optional: Email configuration
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start at http://localhost:8080/api

### 4. Frontend Setup

Open a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

The frontend will start at http://localhost:3000

## First-Time Setup

### 1. Create Initial Roles

You'll need to create roles in the database. Connect to your database and run:

```sql
INSERT INTO roles (name, description, created_at) VALUES
('ADMINISTRATOR', 'Full system access', NOW()),
('BACK_OFFICE_USER', 'Review and approve submissions', NOW()),
('EXTERNAL_USER', 'Submit documents and forms', NOW());

-- Create basic permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('MANAGE_USERS', 'Manage users', 'users', 'manage'),
('MANAGE_FORMS', 'Manage forms', 'forms', 'manage'),
('APPROVE_DOCUMENTS', 'Approve documents', 'documents', 'approve'),
('SUBMIT_DOCUMENTS', 'Submit documents', 'documents', 'submit');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMINISTRATOR';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'BACK_OFFICE_USER' AND p.name IN ('APPROVE_DOCUMENTS');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'EXTERNAL_USER' AND p.name IN ('SUBMIT_DOCUMENTS');
```

### 2. Create Admin User

Visit http://localhost:3000/signup and create a user with the following details:
- Username: admin
- Email: admin@example.com
- Password: (choose a strong password)
- User Type: ADMINISTRATOR

Then manually update the database to assign the ADMINISTRATOR role:

```sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMINISTRATOR';
```

### 3. Create Sample Approval Workflow

```sql
-- Create a simple 2-step approval workflow
INSERT INTO approval_workflows (name, description, workflow_code, is_active, requires_digital_signature, created_at)
VALUES ('Standard Approval', 'Two-step approval process', 'STD-APPROVAL', true, true, NOW());

-- Get the workflow ID
SET @workflow_id = LAST_INSERT_ID();

-- Create approval steps
INSERT INTO approval_steps (workflow_id, step_name, step_order, description, requires_all_approvers, is_final_step, requires_signature)
VALUES
(@workflow_id, 'Initial Review', 1, 'First level review', false, false, false),
(@workflow_id, 'Final Approval', 2, 'Final approval and signature', false, true, true);

-- Assign back office role to both steps
INSERT INTO step_approver_roles (step_id, role_id)
SELECT s.id, r.id FROM approval_steps s, roles r
WHERE s.workflow_id = @workflow_id AND r.name = 'BACK_OFFICE_USER';
```

### 4. Create Sample Form

```sql
INSERT INTO forms (name, description, form_code, schema, ui_schema, is_active, version, approval_workflow_id, created_at)
VALUES (
  'Document Submission Form',
  'Standard form for document submission',
  'DOC-SUBMIT',
  '{"type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"}}}',
  '{"title":{"ui:widget":"text"},"description":{"ui:widget":"textarea"}}',
  true,
  1,
  @workflow_id,
  NOW()
);
```

## Testing the System

### 1. Login as Admin
- Go to http://localhost:3000/login
- Login with your admin credentials
- You should see the admin dashboard

### 2. Create Test Users
- Create a back office user (for approvals)
- Create an external user (for submissions)

### 3. Test Workflow
1. Login as external user
2. Go to "New Submission"
3. Fill the form and upload documents
4. Submit for approval
5. Logout and login as back office user
6. Review and approve the submission
7. Sign the document (if enabled)

## Troubleshooting

### Backend won't start
- Check if port 8080 is available
- Verify database connection settings
- Check if Java 17 is being used: `java -version`
- Review logs in console

### Frontend won't start
- Check if port 3000 is available
- Verify `NEXT_PUBLIC_API_URL` in .env.local
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database connection errors
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in application.yml
- Try using H2 database for development (set in application.yml)

### CORS errors
- Verify CORS settings in SecurityConfig.java
- Check that frontend URL is in allowed origins
- Ensure both backend and frontend are running

## Development Tips

### Using H2 Database (Development)
Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:efiling_db
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
```

Access H2 Console at: http://localhost:8080/api/h2-console

### Hot Reload
- Backend: Spring DevTools is included for auto-restart
- Frontend: Next.js has built-in hot reload

### Viewing Emails (Development)
If you don't have SMTP configured, emails will be logged to console. Consider using:
- [MailHog](https://github.com/mailhog/MailHog) - Local email testing tool
- [Mailtrap](https://mailtrap.io/) - Email testing service

## Next Steps

1. Configure production database
2. Set up SSL/TLS certificates
3. Configure production SMTP server
4. Set up S3 for document storage (optional)
5. Configure digital signature certificates
6. Set up monitoring and logging
7. Deploy to production environment

For detailed deployment instructions, see README.md
