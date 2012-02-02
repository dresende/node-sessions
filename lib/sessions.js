var util = require("util"),
    events = require("events"),
    fs = require("fs"),
    path = require("path"),
    sessionStores = {};

function Sessions(store, opts) {
	events.EventEmitter.call(this);

	this.store = (typeof store != "undefined" && store !== null ? new store() : new module.exports.stores.memory());
	this.opts = opts || {};
	this.sessions = {};

	this._checkTimeoutId = null;

	if (!this.opts.hasOwnProperty("expires")) {
		this.opts.expires = 300;
	}
	if (!this.opts.hasOwnProperty("domain")) {
		this.opts.domain = null;
	}
	if (!this.opts.hasOwnProperty("path")) {
		this.opts.path = "/";
	}
}
util.inherits(Sessions, events.EventEmitter);

Sessions.prototype.total = function () {
	return Object.keys(this.sessions).length;
};
Sessions.prototype.get = function (uid) {
	if (this.sessions.hasOwnProperty(uid)) {
		return this.sessions[uid];
	}
	return null;
};
Sessions.prototype.create = function () {
	var sessions = this,
	    uid = null,
	    data = {};

	for (var i = 0; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
			case "string":
				uid = arguments[i];
				break;
			case "object":
				data = arguments[i];
				break;
		}
	}

	if (uid === null) {
		uid = this.uid();
	}

	if (this.store.add(uid, {
		   data: data,
		expires: Date.now() + (this.opts.expires * 1000)
	}) === false) {
		return null;
	}

	this.sessions[uid] = {
		get: function (key) {
			if (typeof key == "undefined") {
				return sessions.store.get(uid).data;
			}
			return sessions.store.get(uid).data[key] || null;
		},
		set: function (key, value) {
			if (typeof key == "object") {
				sessions.store.set(uid, key);
			} else {
				var o = {};
				o[key] = value;

				sessions.store.set(uid, o);
			}
			return this;
		},
		refresh: function (expires) {
			sessions.store.set(uid, {
				expires: Date.now() + ((expires || sessions.opts.expires) * 1000)
			});
			return this;
		},
		expire: function () {
			sessions.store.remove(uid);

			delete sessions.sessions[uid];

			sessions.emit("expired", uid, true);

			return this;
		},
		uid: function () {
			return uid;
		},
		expires: function () {
			var sess = sessions.store.get(uid);

			return (sess ? sess.expires : null);
		}
	};

	if (this._checkTimeoutId === null) {
		this._checkTimeoutId = setTimeout((function (me) {
			return function () {
				me.checkExpiration();
			};
		})(this), (this.opts.expires + 1) * 1000);
	}

	return this.sessions[uid];
};
Sessions.prototype.uid = function () {
	return String(Math.random()).substr(2) + String(Math.random()).substr(2);
};
Sessions.prototype.httpRequest = function (req, res) {
	var cookies = {}, session;

	req.headers.cookie && req.headers.cookie.split(";").forEach(function (param) {
		var part = param.split("=", 2);

		cookies[part[0].toLowerCase()] = part[1] || true;
	});

	if (!cookies.hasOwnProperty("uid")) {
		session = this.create();

		setHttpCookie(res, "uid", session.uid(), session.expires(), this.opts.path, this.opts.domain);

		return session;
	}

	session = this.get(cookies.uid);
	if (session === null) {
		session = this.create();
		console.log("creating new session..");

		setHttpCookie(res, "uid", session.uid(), session.expires(), this.opts.path, this.opts.domain);
	}

	return session;
};
Sessions.prototype.checkExpiration = function () {
	var uids = this.store.uids(), sess,
	    i = 0, l = uids.length, dt = Date.now(),
	    next_expires = null;

	this.emit("expirecheck");

	for (; i < l; i++) {
		sess = this.store.get(uids[i]);

		if (sess.expires <= dt) {
			this.emit("expired", uids[i], false);
			this.store.remove(uids[i]);
			continue;
		}
		if (next_expires === null) {
			next_expires = sess.expires;
			continue;
		}
		if (sess.expires < next_expires) {
			next_expires = sess.expires;
		}
	}

	if (next_expires !== null) {
		i = (next_expires - Date.now()) / 1000;

		this._checkTimeoutId = setTimeout((function (me) {
			return function () {
				me.checkExpiration();
			};
		})(this), (i > 0 ? (i + 1) : 10) * 1000);
	}
};

initStores();

module.exports = Sessions;
module.exports.stores = sessionStores;

function initStores() {
	var stores, store, i = 0;

	try {
		stores = fs.readdirSync(__dirname + "/store/");

		for (; i < stores.length; i++) {
			store = path.basename(stores[i], path.extname(stores[i]));

			sessionStores[store] = require(__dirname + "/store/" + stores[i]);
		}
	} catch (e) { }
}

function setHttpCookie(res, key, value, expires, path, domain) {
	var cookie = [], dt;

	if (domain !== null) {
		cookie.push("domain=" + domain);
	}

	if (expires !== null) {
		if (util.isDate(expires)) {
			dt = expires;
		} else {
			dt = new Date();
			dt.setTime(expires);
		}

		cookie.push("expires=" + dt.toGMTString());
	}

	res.setHeader("Set-cookie", cookie.join("; "));
}
