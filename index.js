const Events = require('events.io');

class Socket extends Events {
    constructor(url, timeout = 5000) {
        super();
        this._url = url || location.protocol == 'https:' ? 'wss://' : 'ws://' + location.host;
        this._init = this._init.bind(this);
        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
        this._message = this._message.bind(this);
        this._timeout = timeout;
        this._queue = [];
        this._k = 0;
        this._init();

        return new Proxy(this, {
            get: function(target, property) {
                if (property in target) {
                    return target[property];
                } else {
                    return target[property] = target.emit.bind(target, property);
                }
            }
        });
    }
    _init() {
        this.ws = new WebSocket(this._url);
        this.ws.onopen = this._open;
        this.ws.onclose = this._close;
        this.ws.onmessage = this._message;
    }
    _open() {
        this.cleanQueue();
    }
    _message(v) {
        let [type, arg, id] = JSON.parse(v.data);
        if (id === undefined) {
            super.emit(type, ...arg);
        } else {
            super.emit(type, ...arg, (...arg) => this.emit(id, ...arg));
        }
    }
    _close(v) {
        if (v.wasClean === false) {
            setTimeout(this._init, this._timeout);
        }
    }
    cleanQueue() {
        let i, size = this._queue.length;
        for (i = 0; i < size; ++i) {
            this.send(this._queue[i]);
        }
        this._queue.splice(0, size);
    }
    emit(type, ...arg) {
        if (typeof arg[arg.length - 1] === 'function') {
            let id = this._k++;
            this.once(id, arg.pop());
            this.send(JSON.stringify([type, arg, id]));
        } else {
            this.send(JSON.stringify([type, arg]));
        }
    }
    send(v) {
        try {
            this.ws.send(v);
        } catch (err) {
            this._queue.push(v);
        }
    }
}

module.exports = Socket;