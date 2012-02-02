/**
 * This example create a session handler stored in memory.
 *
 * - session1, session2 and another session are created
 * - session1 is refreshed (expire time updated) every second (to avoid expiration)
 * - after 5 seconds (defined in session handler creation) session2 expires
 * - when session2 expires, session1 refresh is stopped (interval cleared)
 * - the 3rd session will expire 3 seconds later (because on creation it was refreshed with 8 seconds instead of the 3)
 * - after another 5 seconds session1 expires
 *
 * You ca see 2 events on session handler (Sessions):
 * - expired: when a session expires
 * - expirecheck: when session handler will check expiration
 *
 * Session expiration check is not done by polling, but calculated based on
 * the next session to expire.
 **/
var sessions = require("../lib/sessions"),
    Sessions = new sessions(sessions.stores.memory, { expires: 5 });

var session1 = Sessions.create("session1"),
    session2 = Sessions.create("session2"),
    session3 = Sessions.create(/* name automatically generated */).refresh(8),
    intervalId = null;

console.log("* created session '%s'", session1.uid());
console.log("* created session '%s'", session2.uid());
console.log("* created session '%s'", session3.uid());

Sessions.on("expired", function (uid) {
	console.log("! session expired:", uid);

	if (intervalId !== null) {
		clearInterval(intervalId);
	}
});
Sessions.on("expirecheck", function () {
	console.log("* checking session expiration..");
});

intervalId = setInterval(function () {
	session1.refresh();
}, 1000);