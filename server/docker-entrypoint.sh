#!/bin/sh
set -e

echo "─────────────────────────────────────────"
echo "  ExecOS AI — Container Startup"
echo "─────────────────────────────────────────"

# Run Prisma migrations against the production database
echo "⏳ Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations complete."

# Start the application
echo "🚀 Starting server..."
exec node src/server.js
