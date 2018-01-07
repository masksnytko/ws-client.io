const Events = require('events.io');

class Socket extends Events {
    constructor(url, timeout = 5000) {

        super();

        this._url = url || location.protocol == 'https:' ? 'wss://' : 'ws://' + location.host;
        this._reInit = this._init.bind(this);
        this._timeout = timeout;
        this._queue = [];
        this._init();

        return new Proxy(this, {
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
                setTimeout(this._reInit, this._timeout);
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
        let i, size = this._queue.length;
        for (i = 0; i < size; ++i) {
            this._ws.send(this._queue[i]);
        }
        this._queue.splice(0, size);
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