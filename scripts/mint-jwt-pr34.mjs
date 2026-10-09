import { SignJWT } from 'jose';
import crypto from 'crypto';

async function main() {
  const secret = new TextEncoder().encode('test-secret');
  const email = 'cerpamedia@gmail.com';
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 days
  
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);
  
  const sessionId = crypto.randomBytes(16).toString('hex');
  
  console.log('JWT_TOKEN=' + token);
  console.log('SESSION_ID=' + sessionId);
  console.log('EMAIL=' + email);
  console.log('IAT=' + now);
  console.log('EXP=' + exp);
}

main();
