# Deploy Internal Audit บน DigitalOcean

คู่มือการ deploy โปรเจกต์ Internal Audit (Next.js + Prisma + PostgreSQL) บน DigitalOcean

---

## สารบัญ

- [ภาพรวม Architecture](#ภาพรวม-architecture)
- [วิธีที่ 1: App Platform (แนะนำ)](#วิธีที่-1-app-platform-แนะนำ)
- [วิธีที่ 2: Droplet + Docker Compose](#วิธีที่-2-droplet--docker-compose)
- [การตั้งค่า Domain และ SSL](#การตั้งค่า-domain-และ-ssl)
- [การ Seed ข้อมูลเริ่มต้น](#การ-seed-ข้อมูลเริ่มต้น)
- [Troubleshooting](#troubleshooting)

---

## ภาพรวม Architecture

```
┌──────────────────────────────────────┐
│          DigitalOcean                │
│                                      │
│  ┌────────────────┐  ┌────────────┐ │
│  │  App Platform   │  │  Managed   │ │
│  │  (Next.js App)  │──│ PostgreSQL │ │
│  │  Port 3000      │  │  Port 25060│ │
│  └────────────────┘  └────────────┘ │
│          │                           │
│          ▼                           │
│  ┌────────────────┐                  │
│  │   SSL/Domain    │                 │
│  │   (Auto HTTPS)  │                 │
│  └────────────────┘                  │
└──────────────────────────────────────┘
```

**ต้องการ:**
- บัญชี DigitalOcean (https://cloud.digitalocean.com)
- GitHub repository (https://github.com/chayanoon17/internal-audit)
- Domain name (ถ้าต้องการ custom domain)

---

## วิธีที่ 1: App Platform (แนะนำ)

วิธีนี้ง่ายที่สุด DigitalOcean จัดการ server, SSL, scaling ให้ทั้งหมด

### ขั้นตอนที่ 1: สร้าง Managed Database

1. ไปที่ **DigitalOcean Console** → **Databases** → **Create Database Cluster**
2. เลือก:
   - **Engine:** PostgreSQL 17
   - **Region:** Singapore (sgp1) - ใกล้ไทยที่สุด
   - **Plan:** Basic → $15/mo (1 vCPU, 1 GB RAM, 10 GB Disk)
   - **Database name:** `internal-audit-db`
3. กด **Create Database Cluster** รอประมาณ 3-5 นาที
4. เมื่อสร้างเสร็จ ไปที่ **Connection Details** → เลือก **Connection string** แล้วคัดลอก connection string ไว้:

```
postgresql://doadmin:<PASSWORD>@internal-audit-db-do-user-xxxxx-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

### ขั้นตอนที่ 2: สร้าง App บน App Platform

1. ไปที่ **App Platform** → **Create App**
2. เลือก **GitHub** เป็น Source → เชื่อมต่อ GitHub account
3. เลือก Repository: `chayanoon17/internal-audit` → Branch: `main`
4. DigitalOcean จะตรวจจับว่าเป็น Next.js อัตโนมัติ

### ขั้นตอนที่ 3: ตั้งค่า Build & Run

ในหน้า **App Settings**:

**Build Command:**

```bash
npx prisma generate && npm run build
```

**Run Command:**

```bash
npm run start
```

**HTTP Port:** `3000`

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

ไปที่ **Settings** → **App-Level Environment Variables** แล้วเพิ่ม:

| Key | Value | Encrypt |
|-----|-------|---------|
| `DATABASE_URL` | `postgresql://doadmin:<PASSWORD>@...ondigitalocean.com:25060/defaultdb?sslmode=require` | ✅ Yes |
| `AUTH_SECRET` | *(สร้างด้วยคำสั่งด้านล่าง)* | ✅ Yes |
| `AUTH_URL` | `https://your-app-xxxxx.ondigitalocean.app` | No |
| `NODE_ENV` | `production` | No |

สร้าง `AUTH_SECRET` ด้วยคำสั่ง:

```bash
openssl rand -base64 32
```

### ขั้นตอนที่ 5: ตั้งค่า Plan และ Deploy

1. เลือก **Plan:** Basic → $5/mo (512 MB RAM, 1 vCPU)
2. เลือก **Region:** Singapore (sgp1)
3. กด **Create Resources**
4. รอ build + deploy ประมาณ 5-10 นาที
5. เมื่อเสร็จจะได้ URL เช่น `https://internal-audit-xxxxx.ondigitalocean.app`

### ขั้นตอนที่ 6: Push Schema ไปยัง Database

หลัง deploy สำเร็จ ให้รัน Prisma db push จากเครื่อง local โดยใช้ production DATABASE_URL:

```bash
# ตั้งค่า DATABASE_URL ชั่วคราว (PowerShell)
$env:DATABASE_URL = "postgresql://doadmin:<PASSWORD>@...ondigitalocean.com:25060/defaultdb?sslmode=require"

# Push schema ไปยัง production database
npx prisma db push

# Seed ข้อมูลเริ่มต้น (departments + admin user)
npx prisma db seed
```

### ขั้นตอนที่ 7: ตั้งค่า Auto Deploy

App Platform จะ auto deploy ทุกครั้งที่ push code ไป `main` branch อัตโนมัติ ไม่ต้องตั้งค่าเพิ่มเติม

---

## วิธีที่ 2: Droplet + Docker Compose

วิธีนี้ให้ control มากกว่า เหมาะกับทีมที่ต้องการจัดการ server เอง

### ขั้นตอนที่ 1: สร้าง Droplet

1. ไปที่ **Droplets** → **Create Droplet**
2. เลือก:
   - **Image:** Ubuntu 24.04 LTS
   - **Plan:** Basic → $12/mo (1 vCPU, 2 GB RAM, 50 GB Disk)
   - **Region:** Singapore (sgp1)
   - **Authentication:** SSH Key (แนะนำ) หรือ Password
3. กด **Create Droplet**
4. จด IP Address ไว้ เช่น `143.198.xxx.xxx`

### ขั้นตอนที่ 2: เตรียม Server

SSH เข้า Droplet:

```bash
ssh root@143.198.xxx.xxx
```

ติดตั้ง Docker + Docker Compose:

```bash
# อัปเดต packages
apt update && apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# ตรวจสอบ
docker --version
docker compose version
```

ติดตั้ง Node.js (สำหรับ build):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node --version
```

### ขั้นตอนที่ 3: Clone โปรเจกต์

```bash
cd /opt
git clone https://github.com/chayanoon17/internal-audit.git
cd internal-audit
```

### ขั้นตอนที่ 4: สร้างไฟล์ Production Docker Compose

สร้างไฟล์ `docker-compose.prod.yml`:

```yaml
services:
  postgres:
    image: postgres:18
    restart: always
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_USER: audit_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: internal_audit
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U audit_user -d internal_audit"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://audit_user:${DB_PASSWORD}@postgres:5432/internal_audit?schema=public
      AUTH_SECRET: ${AUTH_SECRET}
      AUTH_URL: ${AUTH_URL}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

### ขั้นตอนที่ 5: สร้าง Dockerfile

สร้างไฟล์ `Dockerfile`:

```dockerfile
FROM node:22-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

> **หมายเหตุ:** ต้องเพิ่ม `output: "standalone"` ใน `next.config.ts` ด้วย (ดูขั้นตอนที่ 6)

### ขั้นตอนที่ 6: แก้ไข next.config.ts

เพิ่ม `output: "standalone"` ในไฟล์ `next.config.ts`:

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
}

export default nextConfig
```

### ขั้นตอนที่ 7: สร้างไฟล์ .env.production

```bash
cd /opt/internal-audit

cat > .env.production << 'EOF'
DB_PASSWORD=your-strong-password-here
AUTH_SECRET=your-generated-secret-here
AUTH_URL=https://your-domain.com
EOF

chmod 600 .env.production
```

สร้าง password และ secret:

```bash
# สร้าง DB_PASSWORD
openssl rand -base64 24

# สร้าง AUTH_SECRET
openssl rand -base64 32
```

### ขั้นตอนที่ 8: Build และ Run

```bash
# Build และ start ทุก service
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# ดู logs
docker compose -f docker-compose.prod.yml logs -f

# รอ PostgreSQL พร้อม แล้ว push schema + seed
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### ขั้นตอนที่ 9: ตั้งค่า Nginx Reverse Proxy + SSL

ติดตั้ง Nginx และ Certbot:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

สร้าง Nginx config:

```bash
cat > /etc/nginx/sites-available/internal-audit << 'EOF'
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/internal-audit /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

ติดตั้ง SSL (ต้อง point domain มาที่ Droplet IP ก่อน):

```bash
certbot --nginx -d your-domain.com
```

### ขั้นตอนที่ 10: ตั้งค่า Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### ขั้นตอนที่ 11: Auto Deploy ด้วย GitHub Actions (Optional)

สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /opt/internal-audit
            git pull origin main
            docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
            docker compose -f docker-compose.prod.yml exec -T app npx prisma db push
```

ตั้งค่า GitHub Secrets:
- `DO_HOST` → IP ของ Droplet
- `DO_SSH_KEY` → SSH private key

---

## การตั้งค่า Domain และ SSL

### App Platform (วิธีที่ 1)

1. ไปที่ **App Settings** → **Domains**
2. กด **Add Domain**
3. ใส่ domain เช่น `audit.your-domain.com`
4. ทำตามขั้นตอนเพิ่ม CNAME record ที่ DNS provider
5. SSL จะถูกตั้งค่าอัตโนมัติ

### Droplet (วิธีที่ 2)

1. ไปที่ DNS provider (เช่น Cloudflare, Namecheap)
2. เพิ่ม **A Record:**
   - **Name:** `audit` (หรือ `@` สำหรับ root domain)
   - **Value:** IP ของ Droplet
3. รัน Certbot (ดูขั้นตอนที่ 9)

---

## การ Seed ข้อมูลเริ่มต้น

หลัง deploy สำเร็จ ต้อง seed ข้อมูลเริ่มต้น (departments + admin user):

```bash
# App Platform — รันจากเครื่อง local
$env:DATABASE_URL = "postgresql://doadmin:<PASSWORD>@...ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma db push
npx prisma db seed

# Droplet — รันบน server
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

**Admin account ที่ seed ไว้:**
- Email: `admin@audit.com`
- Password: `admin1234`

> ⚠️ **สำคัญ:** เปลี่ยนรหัสผ่าน admin ทันทีหลัง deploy

---

## Troubleshooting

### App ไม่สามารถเชื่อมต่อ Database

```
Error: Can't reach database server
```

**แก้ไข:**
- ตรวจสอบ `DATABASE_URL` ถูกต้อง
- App Platform: ตรวจสอบว่า Database อยู่ใน Region เดียวกัน และเพิ่ม App เป็น Trusted Source ใน Database settings
- Droplet: ตรวจสอบว่า PostgreSQL container รันอยู่ (`docker compose ps`)

### Build ล้มเหลว — Prisma Generate

```
Error: @prisma/client did not initialize yet
```

**แก้ไข:** ตรวจสอบว่า Build Command มี `npx prisma generate` ก่อน `npm run build`

### AUTH_URL ไม่ถูกต้อง

```
Error: [auth][error] CallbackRouteError
```

**แก้ไข:** ตั้งค่า `AUTH_URL` ให้ตรงกับ URL จริง (รวม `https://`)

### ดู Logs

```bash
# App Platform
# ไปที่ App → Runtime Logs ใน Console

# Droplet
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

## สรุปค่าใช้จ่าย (ประมาณ)

| รายการ | App Platform | Droplet |
|--------|-------------|---------|
| App / Server | $5/mo | $12/mo |
| Database | $15/mo | รวมใน Droplet |
| Domain + SSL | ฟรี (auto) | ฟรี (Let's Encrypt) |
| **รวม** | **~$20/mo** | **~$12/mo** |

---

## Checklist ก่อน Go-Live

- [ ] เปลี่ยน `AUTH_SECRET` เป็นค่าที่สร้างจาก `openssl rand -base64 32`
- [ ] ตั้งค่า `AUTH_URL` ให้ตรงกับ production URL
- [ ] ใช้ strong password สำหรับ Database
- [ ] เปลี่ยนรหัสผ่าน admin account หลัง seed
- [ ] ตั้งค่า Firewall (Droplet)
- [ ] ตั้งค่า Database backup (DigitalOcean Console → Database → Backups)
- [ ] ทดสอบ login, สร้าง audit, drag-and-drop บน production
