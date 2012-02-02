var vows = require("vows"),
    assert = require("assert"),
    memoryStore = require("../lib/sessions").stores.memory,
    dup_id = "dupid";

vows.describe("memory store").addBatch({
	"a clean memory store": {
		topic: new memoryStore(),
		"should have no uids initially": function (topic) {
			assert.isArray(topic.uids());
			assert.equal(topic.uids().length, 0);
		},
		"add duplicated uids should not be possible": function (topic) {
			assert.isTrue(topic.add(dup_id, { dup: false }));
			assert.isFalse(topic.add(dup_id, { dup: true }));
		},
		"changing current uid data is possible": function (topic) {
			assert.isTrue(topic.set(dup_id, { dup: true }));
		},
		"changing unknown uid data is impossible": function (topic) {
			assert.isFalse(topic.set(dup_id + "-unknown", { dup: true }));
		},
		"previous uid data should be ok": function (topic) {
			assert.isTrue(topic.get(dup_id, "dup"));
			assert.deepEqual(topic.get(dup_id), { dup: true });
		},
		"previous uid unknown data should return null": function (topic) {
			assert.isNull(topic.get(dup_id, "unknown key"));
		},
		"only one uid should be present now": function (topic) {
			assert.isArray(topic.uids());
			assert.equal(topic.uids().length, 1);
		},
		"removing a property should be ok": function (topic) {
			assert.isTrue(topic.remove(dup_id, "dup"));
			assert.isNull(topic.get(dup_id, "dup"));
			assert.isEmpty(topic.get(dup_id));
		},
		"removing an uid should be ok": function (topic) {
			assert.isTrue(topic.remove(dup_id));
			assert.isNull(topic.get(dup_id, "dup"));
			assert.isNull(topic.get(dup_id));
		},
		"no uids should be in store now": function (topic) {
			assert.isArray(topic.uids());
			assert.equal(topic.uids().length, 0);
		}
	}
}).export(module);