const http = require('http');
const https = require('https');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
Stream = require('stream').Transform,


/**
 * getJSON:  RESTful GET request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */

/*
 const options = {
  host: 'somesite.com',
  port: 443,
  path: '/some/path',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};*/

module.exports.getRaw = (options, onResult) => {
  console.log('HttpRequest::getRaw');
  const port = options.port == 443 ? https : http;

  let output = '';

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      onResult(res.statusCode, output);
    });
  });

  req.on('error', (err) => {
    console.log(err)
  });

  req.end();
};

module.exports.getJSON = (options, onResult) => {
  console.log('HttpRequest::getJSON');
  const port = options.port == 443 ? https : http;

  let output = '';

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      let obj = JSON.parse(output);

      onResult(res.statusCode, obj);
    });
  });

  req.on('error', (err) => {
    // res.send('error: ' + err.message);
  });

  req.end();
};

module.exports.getXML = (options, onResult) => {
  console.log('HttpRequest::getXML');
  const port = options.port == 443 ? https : http;

  let output = '';

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {

      let obj = new JSDOM(output);

      onResult(res.statusCode, obj);
    });
  });

  req.on('error', (err) => {
    // res.send('error: ' + err.message);
  });

  req.end();
};

module.exports.getFile = (options, onResult) => {
  console.log('HttpRequest::getFile');
  const port = options.port == 443 ? https : http;

  var data = new Stream();

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);

    res.on('data', (chunk) => {
      data.push(chunk);
    });

    res.on('end', () => {

      let output = data.read();
      let filename = options.path.split('/').pop();
      
      fs.writeFileSync("./LastDaily/" + filename, output);
      console.log("Download Completed");
      
      onResult(res.statusCode, filename);
    });
  });

  req.on('error', (err) => {
    // res.send('error: ' + err.message);
  });

  req.end();
};