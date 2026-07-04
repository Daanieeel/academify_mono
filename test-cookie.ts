async function test() {
  const result = await fetch('http://localhost:3001/api/auth/get-session', {
    method: 'GET',
    headers: {
      Cookie: 'better-auth.session_token=RZC0OZYlDjzr4eaikSQe3foi6LiW64I9',
    },
  });
  const data = await result.json();
  console.log('Session:', data?.session?.token ? 'Success!' : data);
}
test();
