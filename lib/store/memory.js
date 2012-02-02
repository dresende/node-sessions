function MemoryStore() {
	this.store = {};
}
MemoryStore.prototype.add = function (uid, data) {
	if (this.store.hasOwnProperty(uid)) {
		return false;
	}

	this.store[uid] = data || {};

	return true;
};
MemoryStore.prototype.uids = function () {
	return Object.keys(this.store);
};
MemoryStore.prototype.set = function (uid, data) {
	if (!this.store.hasOwnProperty(uid)) {
		return false;
	}

	for (k in data) {
		this.store[uid][k] = data[k];
	}

	return true;
};
MemoryStore.prototype.get = function (uid, key) {
	if (this.store.hasOwnProperty(uid)) {
		if (typeof key == "undefined") {
			return this.store[uid];
		}
		return this.store[uid].hasOwnProperty(key) ? this.store[uid][key] : null;
	}
	return null;
};
MemoryStore.prototype.remove = function () {
	var items = Array.prototype.slice.apply(arguments),
	    uid = items.shift();

	if (!this.store.hasOwnProperty(uid)) {
		return false;
	}
	if (items.length == 0) {
		delete this.store[uid];
	} else {
		for (k in items) {
			delete this.store[uid][items[k]];
		}
	}
	return true;
};

module.exports = MemoryStore;