# Sistem Informasi Desa

Aplikasi web komprehensif untuk sistem informasi desa dengan fitur lengkap dan keamanan tingkat enterprise.

## 🚀 Fitur Utama

### 1. Sistem Pengumuman
- CRUD pengumuman dengan rich text editor
- Kategori pengumuman (urgent, biasa, info)
- Penjadwalan publikasi otomatis
- Notifikasi push untuk pengumuman penting

### 2. Sistem Aduan Warga
- Form aduan dengan upload foto/dokumen
- Tracking status aduan (diterima, diproses, selesai)
- Sistem rating dan feedback
- Dashboard admin untuk mengelola aduan

### 3. Agenda Kalender Kegiatan
- Calendar view dengan event management
- Reminder otomatis via email/SMS
- Export ke format iCal
- Integrasi dengan Google Calendar

### 4. SOP & Dokumen Publik
- Upload dan kategorisasi dokumen
- Search dan filter dokumen
- Version control untuk dokumen
- Download tracking dan analytics

### 5. Galeri Foto & Video
- Upload batch dengan compression otomatis
- Thumbnail generation
- Lazy loading dan infinite scroll
- Watermark otomatis untuk foto

### 6. Direktori Kontak
- Database kontak pejabat dan instansi
- Search dan filter berdasarkan jabatan/bidang
- Export ke vCard
- Integrasi dengan WhatsApp Business API

### 7. Statistik Dashboard
- Grafik kependudukan (chart.js/recharts)
- Statistik keuangan desa
- Analytics website (visitor, popular content)
- Export laporan ke PDF/Excel

### 8. Multi-User & Role Management
- Role: Super Admin, Admin Desa, Operator, Warga
- Permission-based access control
- Audit log untuk semua aktivitas
- Session management dengan timeout

## 🛡️ Keamanan

- Input validation dan sanitization (joi/yup)
- SQL injection prevention dengan parameterized queries
- XSS protection dengan helmet.js
- CSRF protection
- Rate limiting untuk API endpoints
- File upload validation (type, size, malware scan)
- Password hashing dengan bcrypt (salt rounds 12+)
- Two-factor authentication (2FA) untuk admin
- HTTPS enforcement dengan SSL certificate
- Environment variables untuk sensitive data
- Regular security headers (HSTS, CSP, etc.)

## 🎨 Desain & UX

- Responsive design (mobile-first approach)
- Modern UI dengan design system konsisten
- Dark/light mode toggle
- Progressive Web App (PWA) capabilities
- Loading states dan error handling yang user-friendly
- Accessibility compliance (WCAG 2.1 AA)

## 🏗️ Teknologi

### Backend
- Node.js 22 (LTS)
- Express.js
- PostgreSQL
- JWT Authentication
- Multer untuk file upload
- Helmet.js untuk security headers
- Rate limiting dengan express-rate-limit

### Frontend
- React 18 dengan TypeScript
- Tailwind CSS untuk styling
- React Router untuk routing
- React Query untuk state management
- React Hook Form untuk form handling
- Framer Motion untuk animasi
- Recharts untuk grafik

## 📁 Struktur Project

```
├── server/                 # Backend API
│   ├── config/            # Database dan konfigurasi
│   ├── middleware/        # Authentication, upload, error handling
│   ├── routes/           # API routes
│   └── index.ts          # Server entry point
├── src/                  # Frontend React
│   ├── components/       # Reusable components
│   ├── context/         # React context (Auth, Theme)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── App.tsx          # Main app component
├── uploads/             # File upload directory
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 22 atau lebih baru
- PostgreSQL 14 atau lebih baru
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd sistem-informasi-desa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Buat database PostgreSQL
createdb village_db

# Jalankan migrasi (otomatis saat server start)
```

### 4. Environment Configuration
```bash
# Copy file environment
cp .env.example .env

# Edit .env dengan konfigurasi Anda
```

### 5. Start Development Server
```bash
# Start both frontend and backend
npm run dev

# Atau start secara terpisah
npm run dev:client  # Frontend (port 5173)
npm run dev:server  # Backend (port 5000)
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Announcements Endpoints
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)

### Complaints Endpoints
- `GET /api/complaints` - Get complaints (filtered by role)
- `POST /api/complaints` - Create complaint
- `PATCH /api/complaints/:id/status` - Update status (admin)
- `PATCH /api/complaints/:id/rate` - Rate complaint

### Events Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Documents Endpoints
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Upload document (admin)
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document (admin)

## 🔐 User Roles

### Super Admin
- Full access ke semua fitur
- Manage user roles
- System configuration

### Admin Desa
- Manage content (announcements, events, documents)
- Handle complaints
- View analytics

### Operator
- Basic content management
- Handle complaints

### Warga
- View public content
- Submit complaints
- Manage own profile

## 🛠️ Development Guidelines

### Code Style
- Gunakan TypeScript untuk type safety
- Follow ESLint rules
- Gunakan Prettier untuk formatting
- Write meaningful commit messages

### Security Best Practices
- Selalu validate input di backend
- Gunakan parameterized queries
- Implement proper error handling
- Regular security audits

### Performance
- Implement lazy loading
- Optimize images
- Use React Query untuk caching
- Minimize bundle size

## 📱 PWA Features

- Offline support
- Push notifications
- App-like experience
- Install prompt

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```

### Docker Deployment
```dockerfile
# Dockerfile included for containerized deployment
```

## 📊 Monitoring & Analytics

- Application performance monitoring
- Error tracking
- User analytics
- Security monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk dukungan teknis, hubungi:
- Email: support@desamajubersama.id
- WhatsApp: +62 812-3456-7890

---

**Sistem Informasi Desa** - Membangun desa digital yang transparan dan efisien.