# Deployment Guide

Panduan lengkap untuk deploy Sistem Informasi Desa ke production environment.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Web Server    │────│    Database     │
│    (Nginx)      │    │   (Node.js)     │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  File Storage   │──────────────┘
                        │   (Local/S3)    │
                        └─────────────────┘
```

## 🚀 Deployment Options

### Option 1: Traditional VPS/Server

#### Requirements
- Ubuntu 20.04+ atau CentOS 8+
- Node.js 22+
- PostgreSQL 14+
- Nginx
- SSL Certificate
- Minimum 2GB RAM, 2 CPU cores

#### Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 untuk process management
sudo npm install -g pm2
```

2. **Database Setup**
```bash
# Switch ke postgres user
sudo -u postgres psql

# Create database dan user
CREATE DATABASE village_db;
CREATE USER village_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE village_db TO village_user;
\q
```

3. **Application Deployment**
```bash
# Clone repository
git clone <repository-url> /var/www/village-system
cd /var/www/village-system

# Install dependencies
npm install

# Build application
npm run build

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi production

# Start dengan PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/village-system
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        root /var/www/village-system/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        alias /var/www/village-system/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

5. **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Docker Deployment

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=village_db
      - DB_USER=village_user
      - DB_PASSWORD=secure_password
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=village_db
      - POSTGRES_USER=village_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

#### Dockerfile
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/documents uploads/gallery uploads/complaints uploads/misc

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Option 3: Cloud Deployment (AWS/GCP/Azure)

#### AWS Deployment
```bash
# Using AWS Elastic Beanstalk
eb init village-system
eb create production
eb deploy
```

#### Vercel/Netlify (Frontend Only)
```bash
# Build command
npm run build:client

# Output directory
dist
```

## 🔧 Production Configuration

### Environment Variables
```bash
# Production .env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=village_db_prod
DB_USER=village_user_prod
DB_PASSWORD=super-secure-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters
REFRESH_TOKEN_SECRET=your-super-secure-refresh-secret-minimum-64-characters

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-app-password

# File Storage
UPLOAD_PATH=/var/www/uploads
MAX_FILE_SIZE=10485760

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'village-system',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install monitoring tools
npm install --save @sentry/node @sentry/tracing

# Setup log rotation
sudo apt install logrotate
```

### Health Checks
```bash
# Health check endpoint
curl https://yourdomain.com/api/health

# Database health
curl https://yourdomain.com/api/health/db

# System metrics
curl https://yourdomain.com/api/health/metrics
```

## 🔄 Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/village-system"
DB_NAME="village_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### File Backup
```bash
#!/bin/bash
# file-backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/village-system"
UPLOAD_DIR="/var/www/village-system/uploads"

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz $UPLOAD_DIR

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/uploads_backup_$DATE.tar.gz s3://your-backup-bucket/

# Cleanup
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +7 -delete
```

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
0 3 * * 0 /path/to/file-backup.sh
```

## 🚨 Disaster Recovery

### Recovery Procedures

1. **Database Recovery**
```bash
# Stop application
pm2 stop village-system

# Restore database
gunzip -c db_backup_YYYYMMDD_HHMMSS.sql.gz | psql village_db

# Start application
pm2 start village-system
```

2. **File Recovery**
```bash
# Extract backup
tar -xzf uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/village-system/
```

3. **Full System Recovery**
```bash
# Restore from snapshot
# Follow deployment steps
# Restore database and files
# Update DNS if needed
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_documents_category ON documents(category);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM announcements WHERE status = 'published';
```

### Application Optimization
```bash
# Enable gzip compression
# Implement Redis caching
# Optimize images
# Use CDN for static assets
```

## 🔐 Security Hardening

### Server Hardening
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Setup firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Install fail2ban
sudo apt install fail2ban
```

### Application Hardening
```bash
# Run security audit
npm audit

# Update dependencies
npm update

# Check for vulnerabilities
npx snyk test
```

## 📞 Support & Maintenance

### Maintenance Schedule
- **Daily**: Log review, backup verification
- **Weekly**: Security updates, performance review
- **Monthly**: Full system audit, dependency updates
- **Quarterly**: Penetration testing, disaster recovery test

### Support Contacts
- **Technical**: tech-support@desamajubersama.id
- **Security**: security@desamajubersama.id
- **Emergency**: +62 812-3456-7890 (24/7)

---

**Deployment Guide** - Sistem Informasi Desa v1.0.0