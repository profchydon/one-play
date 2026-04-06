# OneVOnePlay - Setup Guide

Step-by-step guide to run OneVOnePlay (Next.js + PostgreSQL + Redis) locally or on a server using Docker.

---

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development or running scripts outside Docker)

---

## Step 1: Launch an Instance from the AMI

1. Go to **AWS Console** → **EC2** → **AMI**
2. Select the **oneVone AMI** (pre-configured with Docker and dependencies), and click **Launch Instance from AMI**
3. Choose **instance type** (t2.large or larger)
4. Configure **storage** if needed (30 GB+ recommended for Docker builds)
5. Select or create a **key pair** for SSH
6. Ensure **Security Group** allows:
   - **Port 22** (SSH)
   - **Port 3000** (App)
   - **Port 5432** (PostgreSQL) – optional; only if you need external DB access
   - **Port 6379** (Redis) – optional; only if you need external Redis access
7. Launch the instance and note the **public IP**

---

## Step 2: Connect to Your Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

---

## Step 3: Navigate to the Project

```bash
cd /var/www/my-app
```

## Step 4: Configure Environment

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection (see below)
   - `NEXTAUTH_SECRET` – generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` – app URL (e.g. `http://localhost:3000` for local dev)

3. **If you have local PostgreSQL on port 5432**, use a different port for Docker Postgres (e.g. 5434). `docker-compose.yml` maps host port 5434 to Postgres. Set in `.env`:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/onevoneplay"
   ```

   If port 5432 is free, you can use `localhost:5432` and update the compose port mapping accordingly.

---

## Step 5: Build and Start with Docker

```bash
chmod +x run.sh
./run.sh build
./run.sh up
```

Or without the script:

```bash
docker compose -f docker/docker-compose.yml build --no-cache
docker compose -f docker/docker-compose.yml up -d
```

---

## Step 6: Push Database Schema

```bash
npx prisma db push
```

With Docker (ensure `.env` or `DATABASE_URL` points at the running Postgres):

```bash
# If using Docker Postgres on 5434:
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/onevoneplay" npx prisma db push
```

Or run inside the app container (uses internal hostname `postgres`):

```bash
docker compose -f docker/docker-compose.yml exec app npx prisma db push
```

---

## Step 7: Create User Account

**Users can only be created via this script.** There is no self-signup.

### Local (with Node and `DATABASE_URL` in `.env`):

```bash
npm run create-user -- admin@example.com "YourSecurePassword" "Admin Name" BRAND_ADMIN
```

**Note:** Run `create-user` from the project directory on your host. Ensure `DATABASE_URL` in `.env` points to your running Postgres (e.g. `localhost:5434` when using Docker).

**Parameters:**

- `email` – Login email
- `password` – Password (min 8 chars)
- `name` – Optional display name
- `role` – `BRAND_ADMIN` or `PLAYER` (default: `BRAND_ADMIN`)

**Example: create a Brand Admin**

```bash
npm run create-user -- brand@example.com "SecurePass123" "Brand Admin" BRAND_ADMIN
```

**Example: create a Player**

```bash
npm run create-user -- player@example.com "PlayerPass456" "Player Name" PLAYER
```

---

## Step 8: Access the Application

| Service   | URL                     | Port |
| --------- | ----------------------- | ---- |
| App       | http://localhost:3000   | 3000 |
| PostgreSQL| localhost (from host)   | 5434 |
| Redis     | localhost (from host)   | 6379 |

Log in at `http://localhost:3000/login` with the user you created.

---

## Quick Reference Commands

```bash
# Start services
./run.sh up

# Stop services
./run.sh down

# View logs
./run.sh logs
# or: docker compose -f docker/docker-compose.yml logs -f

# Rebuild
./run.sh build

# Create user
npm run create-user -- <email> <password> [name] [role]
```

---

## Local Development (without Docker)

1. Ensure PostgreSQL and Redis are running (or start only Postgres and Redis via Docker).
2. Configure `.env` with `DATABASE_URL` and `REDIS_URL`.
3. Run migrations/schema:

   ```bash
   npx prisma db push
   ```

4. Start the Next.js dev server:

   ```bash
   npm run dev
   ```

5. Create users with:

   ```bash
   npm run create-user -- <email> <password> [name] [role]
   ```

---

## Optional: Production Deployment

For production:

1. Set `NEXTAUTH_SECRET` to a secure random value.
2. Set `NEXTAUTH_URL` to your public URL.
3. Use managed PostgreSQL and Redis (RDS, ElastiCache, etc.) or ensure your DB/Redis instances are accessible and secured.
4. Run Prisma schema and create users as above.
