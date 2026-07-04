async function test() {
  const result = await fetch(
    'http://localhost:3001/api/auth/sign-in/username',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Demo1234!' }),
    },
  );
  const loginData = await result.json();
  const token = loginData.token;

  console.log('Token:', token);

  if (!token) {
    console.log('Login failed');
    return;
  }

  const result2 = await fetch('http://localhost:3001/api/auth/get-session', {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('Session Bearer:', await result2.json());
}
test();
