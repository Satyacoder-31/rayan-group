import https from 'https';

https.get('https://rayan-group.com/api/finance.php?action=get_state', (res) => {
  let data = '';
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Data length:', data.length);
    console.log('Data head:', data.slice(0, 1000));
  });
}).on('error', console.error);
