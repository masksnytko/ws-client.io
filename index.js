const Events = require('events.io');

class Socket extends Events {
    constructor(url) {

        if (Socket.instance !== undefined) {
            return Socket.instance;    
        }

        this._url = url || location.protocol == 'https:' ? 'wss://' : 'ws://' + location.host;
        this._q = [];
        this._init();

        return Socket.instance = new Proxy(this, {
            get: function(target, property, receiver) {
                console.log(arguments);
            }
        });
    }
    _init() {
        this._ws = new WebSocket(this._url);
        this._ws.onopen = v => {
            this._cleanQueue();
        }
        this._ws.onclose = v => {
            if (!v.wasClean) {
				setTimeout(this._init.bind(this), 5000);
			}
        }
        this._ws.onerror = v => {
            console.error(v);
        }
        this._ws.onmessage = v => {
            v = JSON.parse(v.data);
            if (v.length === 3) {
                super.emit(v[0], ...v[1], (...arg) => {
                    this.emit(v[2], ...arg);
                });
            }
        }
    }
    _cleanQueue() {
        for (var i = 0; i < this._q.length; ++i) {
            this._ws.send(this._q[i]);
        }
        this._q = [];
    }
    emit(type, ...arg) {
        let last = arg[arg.length - 1];
        if (typeof last === 'function') {
            let id = Math.random();
            super.once(id, arg.pop());
            this.send([type, arg, id]);
        } else {
            this.send([type, arg]);
        }
    }
    send(v) {
        v = JSON.stringify(v);
        try {
            this._ws.send(v);
        } catch (err) {
            this._q.push(v);
        }
    }
}

module.exports = Socket;