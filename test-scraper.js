const axios = require('axios');

async function testScraper() {
  try {
    console.log('Testing navigation scrape...');
    const response = await axios.post('http://localhost:3001/api/navigation/refresh');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScraper();
