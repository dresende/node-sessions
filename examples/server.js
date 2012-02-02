var http = require("http"),
    sessions = require("../lib/sessions"),
    handler = new sessions(); // defaults to memory store

http.createServer(function (req, res) {
	var session = handler.httpRequest(req, res);

	console.log("[%s] > %s", session.uid(), req.url);

	res.end(req.url);

}).listen(1337, function () {
	console.log("Go to http://localhost:1337/somewhere");
});

handler.on("expired", function (uid) {
	console.log("[%s] ! expired", uid);
});