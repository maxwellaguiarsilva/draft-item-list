import { config } from 'dotenv';
config({ path: '.env.local' });
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
