var util = require("util"),
    events = require("events"),
    fs = require("fs"),
    path = require("path"),
    sessionStores = {};

function Sessions(store, opts) {
	events.EventEmitter.call(this);

	this.store = (typeof store != "undefined" && store !== null ? new store() : new module.exports.stores.memory());
	this.opts = opts || {};
	this._currentSessions = 0;

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
	return this._currentSessions;
};
Sessions.prototype.get = function (uid, cb) {
	var sessions = this;

	this.store.get(uid, function (err, meta, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, buildSessionUtils(uid, meta, data, sessions.store, sessions.opts.expires, sessions), sessions);
	});

	return this;
};
Sessions.prototype.create = function () {
	var sessions = this,
	    uid = null,
	    data = {},
	    meta = { expires: Date.now() + (this.opts.expires * 1000) },
	    cb = null;

	for (var i = 0; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
			case "string":
				uid = arguments[i];
				break;
			case "object":
				data = arguments[i];
				break;
			case "function":
				cb = arguments[i];
				break;
		}
	}

	if (uid === null) {
		uid = this.uid();
	}

	this.store.add(uid, meta, data, function (err, data) {
		if (err) {
			return cb(err);
		}

		if (sessions._checkTimeoutId === null) {
			sessions._checkTimeoutId = setTimeout(function () {
				sessions.checkExpiration();
			}, (sessions.opts.expires + 1) * 1000);
		}

		return cb(null, buildSessionUtils(uid, meta, data, sessions.store, sessions.opts.expires, sessions), sessions);
	});
};
Sessions.prototype.uid = function () {
	return String(Math.random()).substr(2) + String(Math.random()).substr(2);
};
Sessions.prototype.httpRequest = function (req, res, cb) {
	var cookies = {}, session, sessions = this;

	req.headers.cookie && req.headers.cookie.split(";").forEach(function (param) {
		var part = param.split("=", 2);

		cookies[part[0].toLowerCase()] = part[1] || true;
	});

	if (!cookies.hasOwnProperty("uid")) {
		return this.create(function (err, session) {
			if (err) {
				return cb(err);
			}

			setHttpCookie(res, "uid", session.uid(), session.expires(), sessions.opts.path, sessions.opts.domain);

			return cb(null, session, sessions);
		});
	}

	this.get(cookies.uid, function (err, session) {
		if (err) {
			return sessions.create(function (err, session) {
				if (err) {
					return cb(err);
				}

				setHttpCookie(res, "uid", session.uid(), session.expires(), sessions.opts.path, sessions.opts.domain);

				return cb(null, session);
			});
		} else {
			return cb(null, session, sessions);
		}
	});

	return this;
};
Sessions.prototype.checkExpiration = function () {
	var sessions = this,
	    conf = { dt: Date.now(), next: null };

	this.store.uids(function (err, uids) {
		if (err) {
			return;
		}

		var sess, i = 0, l = uids.length, missing = l;

		sessions.emit("expirecheck");

		for (; i < l; i++) {
			checkSessionExpiration(sessions, uids[i], conf, function () {
				missing -= 1;
				if (missing == 0) {
					if (conf.next !== null) {
						i = (conf.next - Date.now()) / 1000;

						sessions._checkTimeoutId = setTimeout(function () {
							sessions.checkExpiration();
						}, (i > 0 ? (i + 1) : 10) * 1000);
					}
				}
			});
		}
	});
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

function checkSessionExpiration(sessions, uid, conf, cb) {
	sessions.store.get(uid, function (err, sess) {
		if (err) return cb();

		if (sess.expires <= conf.dt) {
			sessions.emit("expired", uid, false);
			sessions.store.remove(uid);
			return cb();
		}
		if (conf.next === null) {
			conf.next = sess.expires;
			return cb();
		}
		if (sess.expires < conf.next) {
			conf.next = sess.expires;
		}
		return cb();
	});
}

function setHttpCookie(res, key, value, expires, path, domain) {
	var cookie = [], dt;

	cookie.push(key + "=" + value);

	if (domain !== null) {
		cookie.push("domain=" + domain);
	}
	if (path !== null) {
		cookie.push("path=" + path);
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

function buildSessionUtils(uid, meta, data, store, expires, sessions) {
	return {
		get: function (key) {
			if (typeof key == "undefined") {
				return data;
			}
			return data[key] || null;
		},
		set: function (key, value, cb) {
			if (typeof key == "object") {
				store.set(uid, key, cb);
			} else {
				var o = {};
				o[key] = value;

				store.set(uid, o, cb);
			}
			return this;
		},
		refresh: function (expire) {
			meta.expires = Date.now() + ((expire || expires) * 1000);

			store.set(uid, meta, {});
			return this;
		},
		expire: function () {
			store.remove(uid);

			sessions.emit("expired", uid, true);

			return this;
		},
		uid: function () {
			return uid;
		},
		expires: function () {
			return meta.expires;
		}
	};
}