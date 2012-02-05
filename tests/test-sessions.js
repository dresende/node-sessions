var vows = require("vows"),
    assert = require("assert"),
    sessions = require("../lib/sessions"),
    sessid = "session_id",
    session;

vows.describe("sessions").addBatch({
	"a session handler": {
		topic: new sessions(),
		"should have no sessions initially": function (topic) {
			assert.strictEqual(topic.total(), 0);
		},
		"creating a new session": {
			topic: function (sessions) {
				sessions.create(sessid, this.callback);
			},
			"should be ok": function (err, session) {
				assert.isNull(err);
				assert.isObject(session);
				assert.isFunction(session.get);
				assert.isFunction(session.set);
				assert.isFunction(session.refresh);
				assert.isFunction(session.expire);
				assert.isFunction(session.expires);
				assert.isFunction(session.uid);
			},
			"uid should be the same used": function (err, session) {
				assert.equal(session.uid(), sessid);
			}
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