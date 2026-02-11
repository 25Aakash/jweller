# Setup PostgreSQL Database - Simple Version
# Run this script from the backend directory

Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green
Write-Host ""

# Set password
$env:PGPASSWORD = "aakash123"

Write-Host "Step 1: Creating database..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE jeweller_platform;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully" -ForegroundColor Green
}
else {
    Write-Host "Database might already exist, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Running schema migration..." -ForegroundColor Yellow
psql -U postgres -d jeweller_platform -f migrations/001_initial_schema.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Schema migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "Schema migration completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Setting up row-level security..." -ForegroundColor Yellow
psql -U postgres -d jeweller_platform -f migrations/002_row_level_security.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "RLS setup failed" -ForegroundColor Red
    exit 1
}
Write-Host "RLS configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Loading seed data..." -ForegroundColor Yellow
psql -U postgres -d jeweller_platform -f seeds/dev_seed.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Seed data loading failed" -ForegroundColor Red
    exit 1
}
Write-Host "Seed data loaded" -ForegroundColor Green

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Seed Data:" -ForegroundColor Cyan
Write-Host "  Admin: admin@samplejewellers.com / admin123" -ForegroundColor White
Write-Host "  Customer: +919876543211" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update .env file" -ForegroundColor White
Write-Host "  2. Run: npm install" -ForegroundColor White
Write-Host "  3. Run: npm run dev" -ForegroundColor White
Write-Host ""

# Clear password
$env:PGPASSWORD = $null
