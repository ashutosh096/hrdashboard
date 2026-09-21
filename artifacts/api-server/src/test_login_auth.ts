async function test() {
  console.log('Testing login with ashutosh@ehmconsultancy.com (password123)...');
  const res1 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ashutosh@ehmconsultancy.com', password: 'password123' })
  });
  console.log('Status 1:', res1.status, await res1.json());

  console.log('\nTesting login with ashutoshmishraup78@gmail.com (admin123)...');
  const res2 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ashutoshmishraup78@gmail.com', password: 'admin123' })
  });
  console.log('Status 2:', res2.status, await res2.json());

  console.log('\nTesting login for Pranshu (dubey.pranshu@gmail.com)...');
  const res3 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dubey.pranshu@gmail.com', password: 'password123' })
  });
  console.log('Status 3:', res3.status, await res3.json());
}

test().catch(console.error).finally(() => process.exit(0));
