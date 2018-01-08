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

You can also call a function without a server event
```js
ws.emit('update', 1);

ws.emit('updateAndCallback', 2, (err, res) => {
  console.log(err, res);
});
```

# call the server function
```js
//with callback
ws.getUsers((err, res) => {
  console.log(err, res);
});

//without callback
ws['any function name']('any count arg');
```
