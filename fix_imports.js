const fs = require('fs');
const file = 'src/app/api/auth/register/route.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/import { checkRateLimit, getClientIp } from '@\\/lib\\/security';/, "import { checkRateLimit, getClientIp, generateOTP } from '@/lib/security';");
fs.writeFileSync(file, c);
