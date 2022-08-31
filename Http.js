const http = require('http');
const postData = JSON.stringify({
  "state": "000000",
  "msg": "success",
  "data": {
    "gid": "62fee9980d8afadcf6862efe",
    "cmid": "1661743803313",
    "mid": "630c32bcd02a5340898ab7cb",
    "mtime": 1661743804540,
    "mtype": "TEXT",
    "mbody": "qwe"
  }
});

//
const options = {
  URL: 'https://apibingo.ruixi-sh.com:666/chat/say',
  method: 'POST',
  Code: 200,
  Address: '139.224.252.60:666',
  headers: {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Length': Buffer.byteLength(postData),
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryAUCkKlvuIS8D77x5',
    'Host': 'apibingo.ruixi-sh.com:666',
    'Origin': 'https://www.tapbingo.com',
    'Referer': 'https://www.tapbingo.com/',
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();