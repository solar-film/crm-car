const fs = require('fs');
const https = require('https');

const SHEET_ID = '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Mistake (หักช่าง)')}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Row 1:', data.split('\n')[0]);
    console.log('Row 2:', data.split('\n')[1]);
    console.log('Row 3:', data.split('\n')[2]);
  });
});
