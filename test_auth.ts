import { auth } from './src/auth';
async function test() {
  try {
    const session = await auth();
    console.log('Session:', session);
  } catch (e) {
    console.log('Error:', e);
  }
}
test();
