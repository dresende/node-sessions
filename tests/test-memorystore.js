var vows = require("vows"),
    assert = require("assert"),
    memoryStore = require("../lib/store/memory"),
    store = new memoryStore(),
    testMeta = { meta: "test" },
    dup_id = "dupid";

vows.describe("memory store").addBatch({
	"getting initial uids": {
		topic: function () {
			store.uids(this.callback);
		},
		"should come empty": function (uids) {
			assert.isArray(uids);
			assert.equal(uids.length, 0);
		}
	}
}).addBatch({
	"adding an uid": {
		topic: function () {
			store.add(dup_id, testMeta, { dup: false }, this.callback);
		},
		"should be ok": function (err, meta, data) {
			assert.isNull(err);
			assert.deepEqual(meta, testMeta);
			assert.deepEqual(data, { dup: false });
		}
	}
}).addBatch({
	"but adding again": {
		topic: function () {
			store.add(dup_id, testMeta, { dup: true }, this.callback);
		},
		"should not be ok": function (err, data) {
			assert.isNotNull(err);
		}
	}
}).addBatch({
	"changing current uid data": {
		topic: function () {
			store.set(dup_id, {}, { dup: true }, this.callback);
		},
		"should be ok": function (err, _) {
			assert.isNull(err);
		}
	}
}).addBatch({
	"changing unknown uid data": {
		topic: function () {
			store.set(dup_id + "-unknown", {}, { dup: true }, this.callback);
		},
		"should not be ok": function (err, _) {
			assert.isNotNull(err);
		}
	}
}).addBatch({
	"previous uid data": {
		topic: function () {
			store.get(dup_id, this.callback);
		},
		"should be ok": function (err, meta, data) {
			assert.isNull(err);
			assert.deepEqual(meta, testMeta);
			assert.deepEqual(data, { dup: true });
		}
	}
}).addBatch({
	"previous uid unknown data": {
		topic: function () {
			store.get(dup_id + "-unknown", this.callback);
		},
		"should return error": function (err, _) {
			assert.isNotNull(err);
		}
	}
}).addBatch({
	"the total uids saved": {
		topic: function () {
			store.uids(this.callback);
		},
		"should now be one": function (uids) {
			assert.isArray(uids);
			assert.equal(uids.length, 1);
		}
	}
}).addBatch({
	"removing a property": {
		topic: function () {
			store.remove(dup_id, "dup", this.callback);
		},
		"should be ok": function (err, _) {
			assert.isNull(err);
		}
	}
}).addBatch({
	"removing an uid": {
		topic: function () {
			store.remove(dup_id, this.callback);
		},
		"should be ok": function (err, _) {
			assert.isNull(err);
		}
	}
}).addBatch({
	"the total uids saved": {
		topic: function () {
			store.uids(this.callback);
		},
		"should now be zero": function (uids) {
			assert.isArray(uids);
			assert.equal(uids.length, 0);
		}
	}
}).export(module);