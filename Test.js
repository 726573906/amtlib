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
    "mbody": "1"
  }
});

//
const options = {
  URL: 'https://apibingo.ruixi-sh.com:666/chat/say',
  method: 'POST',
  Code: 200,
  Address: '139.224.252.60:666',
  Policy: 'strict-origin-when-cross-origin',
  headers: {
    'Accept': 'application/json, text/plain',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'BINGO-APP': 'WEB',
    'BINGO-TOKEN': '7b07f773-dcef-4fdd-accb-2abe3ef28e7e',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Length': 449,
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryAUCkKlvuIS8D77x5',
    'Host': 'apibingo.ruixi-sh.com:666',
    'Origin': 'https://www.tapbingo.com',
    'Pragma': 'no-cache',
    'Referer': 'https://www.tapbingo.com/',
    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': "Windows",
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
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