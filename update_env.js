const fs = require('fs');
const file = '.env';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/DIRECT_URL=".+"/, 'DIRECT_URL="postgresql://postgres.ikkwfbvtcdduusicjnof:Marietou413%401995@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"');
fs.writeFileSync(file, c);
