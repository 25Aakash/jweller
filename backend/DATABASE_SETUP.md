# Manual Database Setup Steps

Since PostgreSQL is installed but not in PATH, follow these manual steps:

## Step 1: Create Database

Open a new PowerShell terminal and run:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Enter password: `aakash123`

Then in the psql prompt, run:

```sql
CREATE DATABASE jeweller_platform;
\q
```

## Step 2: Run Schema Migration

```powershell
cd C:\Users\aakas\OneDrive\Desktop\jweller\backend

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f migrations/001_initial_schema.sql
```

Enter password: `aakash123`

## Step 3: Run RLS Migration

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f migrations/002_row_level_security.sql
```

Enter password: `aakash123`

## Step 4: Load Seed Data

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f seeds/dev_seed.sql
```

Enter password: `aakash123`

## Step 5: Verify Setup

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform
```

In psql:
```sql
\dt
SELECT * FROM jewellers;
\q
```

## Step 6: Configure .env

```powershell
copy .env.example .env
```

Edit `.env` and set:
```
DB_PASSWORD=aakash123
```

## Step 7: Install Dependencies and Start Server

```powershell
npm install
npm run dev
```

---

## Quick Copy-Paste Commands

```powershell
# Set password environment variable (so you don't have to type it each time)
$env:PGPASSWORD = "aakash123"

# Create database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE jeweller_platform;"

# Run migrations
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f migrations/001_initial_schema.sql

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f migrations/002_row_level_security.sql

# Load seed data
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -f seeds/dev_seed.sql

# Verify
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jeweller_platform -c "\dt"

# Clear password
$env:PGPASSWORD = $null
```
