var http = require("http"),
    sessions = require("../lib/sessions"),
    handler = new sessions();

http.createServer(function (req, res) {
	handler.httpRequest(req, res, function (err, session) {
		if (err) {
			return res.end("session error");
		}

		console.log("[%s] > %s", session.uid(), req.url);

		res.end(req.url);
	});

}).listen(1337, function () {
	console.log("Go to http://localhost:1337/somewhere");
});

handler.on("expired", function (uid) {
	console.log("[%s] ! expired", uid);
});