// Quick API test script
import http from 'http';

const TOKEN = process.argv[2];
if (!TOKEN) {
  // First, login to get token
  const loginData = JSON.stringify({
    usn: '1MS21CS001',
    password: 'password123'
  });

  const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Login response:', res.statusCode);
      const response = JSON.parse(data);
      if (response.token) {
        console.log('Token obtained! Run: node testApi.js', response.token.substring(0, 50) + '...');
        testSubmit(response.token);
      } else {
        console.log('Login failed:', data);
      }
    });
  });
  loginReq.on('error', e => console.error('Login error:', e));
  loginReq.write(loginData);
  loginReq.end();
} else {
  testSubmit(TOKEN);
}

function testSubmit(token) {
  console.log('\n--- Testing Submit Endpoint ---');
  const submitData = JSON.stringify({
    code: 'print(0, 1)',
    language: 'python'
  });

  const submitReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/practice/1/submit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': Buffer.byteLength(submitData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Submit response status:', res.statusCode);
      console.log('Submit response body:', data);
    });
  });

  submitReq.on('error', e => console.error('Submit error:', e));
  submitReq.write(submitData);
  submitReq.end();
}
