const fs = require('fs');

// Revert .env
let envFile = fs.readFileSync('.env', 'utf8');
envFile = envFile.replace(/DIRECT_URL=".+"/, 'DIRECT_URL="postgresql://postgres.ikkwfbvtcdduusicjnof:Marietou413%401995@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?connect_timeout=30&pgbouncer=true&connection_limit=20"');
fs.writeFileSync('.env', envFile);

// Revert schema.prisma
let schemaFile = fs.readFileSync('prisma/schema.prisma', 'utf8');
schemaFile = schemaFile.replace(/verified      Boolean   @default\(false\)\n  otpCode       String\?\n  otpExpiresAt  DateTime\?/, 'verified      Boolean   @default(false)');
fs.writeFileSync('prisma/schema.prisma', schemaFile);
