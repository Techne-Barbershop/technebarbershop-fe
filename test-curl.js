const http = require('http');

async function test() {
  const loginRes = await fetch("http://localhost:8080/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@gmail.com", password: "password123" }) // Let's guess the password or just use kasir? Wait!
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  const res = await fetch("http://localhost:8080/api/admin/product-sales?start_date=2026-08-25&end_date=2026-08-31", {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
