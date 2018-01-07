const Events = require('events.io');

class Socket extends Events {
    constructor(url) {

        if (Socket.instance !== undefined) {
            return Socket.instance;    
        } else {
            super();
        }

        this._url = url || location.protocol == 'https:' ? 'wss://' : 'ws://' + location.host;
        this._q = [];
        this._init();
        
        return Socket.instance = new Proxy(this, {
            get: function(target, property) {
                if (property in target) {
                    return target[property];
                } else {
                    return target[property] = target.request.bind(target, property);
                }
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
            let [type, arg, id] = JSON.parse(v.data);
            if (id === undefined) {
                this.emit(type, ...arg);
            } else {
                this.emit(type, ...arg, (...arg) => this.request(type, ...arg));
            }
        }
    }
    _cleanQueue() {
        for (var i = 0; i < this._q.length; ++i) {
            this._ws.send(this._q[i]);
        }
        this._q = [];
    }
    request(type, ...arg) {
        if (typeof arg[arg.length - 1] === 'function') {
            let id = Math.random();
            this.once(id, arg.pop());
            this.send(type, arg, id);
        } else {
            this.send(type, arg);
        }
    }
    send(...arg) {
        let v = JSON.stringify(arg);
        try {
            this._ws.send(v);
        } catch (err) {
            this._q.push(v);
        }
    }
}

module.exports = Socket;