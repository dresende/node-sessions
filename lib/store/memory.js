function MemoryStore() {
	this.store = {};
}
MemoryStore.prototype.add = function (uid) {
	var data = {}, cb = null, success = false;

	for (var i = 1; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
			case "function":
				cb = arguments[i];
				break;
			case "object":
				data = arguments[i];
				break;
		}
	}

	if (!this.store.hasOwnProperty(uid)) {
		this.store[uid] = data || {};
		success = true;
	}

	if (cb !== null) {
		if (success) {
			cb(null, data);
		} else {
			cb(new Error("could not add uid"));
		}
	}

	return this;
};
MemoryStore.prototype.uids = function (cb) {
	cb(null, Object.keys(this.store));

	return this;
};
MemoryStore.prototype.set = function (uid, data, cb) {
	if (!this.store.hasOwnProperty(uid)) {
		cb(new Error("uid not found"));

		return this;
	}

	for (k in data) {
		this.store[uid][k] = data[k];
	}

	cb(null);

	return this;
};
MemoryStore.prototype.get = function (uid) {
	var key = null, cb = null;

	for (var i = 1; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
			case "string":
				key = arguments[i];
				break;
			case "function":
				cb = arguments[i];
				break;
		}
	}

	if (cb === null) {
		throw new Error("missing callback");
	}

	if (this.store.hasOwnProperty(uid)) {
		if (key === null) {
			cb(null, this.store[uid]);
		} else {
			cb(null, this.store[uid].hasOwnProperty(key) ? this.store[uid][key] : null);
		}
	} else {
		cb(new Error("uid not found"));
	}

	return this;
};
MemoryStore.prototype.remove = function () {
	var items = Array.prototype.slice.apply(arguments),
	    uid = items.shift(), cb = items.pop();

	if (cb === null) {
		throw new Error("missing callback");
	}

	if (!this.store.hasOwnProperty(uid)) {
		cb(new Error("uid not found"));

		return this;
	}

	if (items.length == 0) {
		delete this.store[uid];
	} else {
		for (k in items) {
			delete this.store[uid][items[k]];
		}
	}
	
	cb(null);

	return this;
};

module.exports = MemoryStore;