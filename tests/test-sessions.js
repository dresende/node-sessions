var vows = require("vows"),
    assert = require("assert"),
    sessions = require("../lib/sessions"),
    sessid = "session_id",
    session;

vows.describe("sessions").addBatch({
	"a clean session handler": {
		topic: new sessions(),
		"should have no sessions initially": function (topic) {
			assert.strictEqual(topic.total(), 0);
		},
		"should be able to create a new session": function (topic) {
			session = topic.create(sessid);

			assert.isObject(session);
			assert.isNotNull(session);
		},
		"new session should have no data": function (topic) {
			assert.isObject(session.get());
			assert.isNull(session.get("undefined"));
		},
		"new session should have defined uid": function (topic) {
			assert.strictEqual(session.uid(), sessid);
		},
		"expiring session should clean it": function (topic) {
			session.expire();

			assert.strictEqual(topic.total(), 0);
		}
	},
	"uid generator": {
		topic: new sessions(),
		"should return new 1000 different ids": function (topic) {
			var ids = [], id, i = 0;

			for (; i < 1000; i++) {
				id = topic.uid();

				if (ids.indexOf(id) == -1) {
					ids.push(id);
				} else {
					assert.isTrue("duplicated IDs");
				}
			}
		}
	}
}).export(module);