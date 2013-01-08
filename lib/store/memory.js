function MemoryStore() {
	this.store = {};
}
MemoryStore.prototype.add = function (uid) {
	var meta = null, data = {}, cb = null, success = false;

	for (var i = 1; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
			case "function":
				cb = arguments[i];
				break;
			case "object":
				if (meta === null) {
					meta = arguments[i];
				} else {
					data = arguments[i];
				}
				break;
		}
	}

	if (meta === null) {
		meta = {};
	}

	if (!this.store.hasOwnProperty(uid)) {
		this.store[uid] = { meta: meta, data: data };
		success = true;
	}

	if (cb !== null) {
		if (success) {
			cb(null, meta, data);
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
MemoryStore.prototype.set = function (uid, meta, data, cb) {
	if (!this.store.hasOwnProperty(uid)) {
		if (typeof cb == "function") {
			cb(new Error("uid not found"));
		}

		return this;
	}

	for (var k in meta) {
		this.store[uid].meta[k] = meta[k];
	}
	for (k in data) {
		this.store[uid].data[k] = data[k];
	}

	if (typeof cb == "function") {
		cb(null);
	}

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
			cb(null, this.store[uid].meta, this.store[uid].data);
		} else {
			cb(null, this.store[uid].data.hasOwnProperty(key) ? this.store[uid].data[key] : null);
		}
	} else {
		cb(new Error("uid not found"));
	}

	return this;
};
MemoryStore.prototype.remove = function () {
	var items = Array.prototype.slice.apply(arguments),
	    uid = items.shift(), cb = items.pop();

	if (!this.store.hasOwnProperty(uid)) {
		if (typeof cb == "function") {
			cb(new Error("uid not found"));
		}

		return this;
	}

	if (items.length === 0) {
		delete this.store[uid];
	} else {
		for (var k in items) {
			delete this.store[uid].data[items[k]];
		}
	}

	if (typeof cb == "function") {
		cb(null);
	}

	return this;
};

module.exports = MemoryStore;
