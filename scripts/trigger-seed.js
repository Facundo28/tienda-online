
fetch('http://127.0.0.1:3000/api/test-seed-ruly')
  .then(res => res.json())
  .then(data => console.log('Seed Result:', data))
  .catch(err => console.error('Seed Error:', err));
