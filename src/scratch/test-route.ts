async function testDailyChallenge() {
  const url = 'http://localhost:3000/api/exams/daily-challenge/start';
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ subjects: ['MATHEMATICS', 'ENGLISH_LANGUAGE', 'PHYSICS', 'CHEMISTRY'] }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Body:', JSON.stringify(data, null, 2));
}

testDailyChallenge().catch(console.error);
