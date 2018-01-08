# Install
npm i ws-client.io

# ws-client.io
```js
const Socket = require('ws-client.io');

let ws = new Socket;
//or
let ws = new Socket(url);
```

# handler
```js
ws.on('update', v => {
  //event handler
});

ws.once('update2', (...arg) => {
  //event handler
});

ws.on('updateAndCallback', (v, cb) => {
  console.log(v);
  cb('ok');
});
```

# call the server function (emit)
```js
//with callback
ws.getUsers((err, res) => {
  console.log(err, res);
});

//without callback
ws['any function name']('any count arg');
```
or
```js
//with callback
ws.emit('getUsers', (err, res) => {
  console.log(err, res);
});

//without callback
ws.emit('any function name', 'any count arg');
```
