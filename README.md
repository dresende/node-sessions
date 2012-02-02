Sessions ![ Travis CI ](https://secure.travis-ci.org/dresende/node-sessions.png)
========

## About

Sessions is a session management module designed to help you manage user sessions.
It supports multiple stores to save your data and can be easly attached to an http
server.

## Installing

Install using NPM:

    npm install sessions

## Usage

    var http = require("http"),
        Sessions = require("sessions"),
        sessionHandler = new Sessions(); // memory store by default
    
    http.createServer(function (req, res) {
        var session = sessionHandler.httpRequest(req, res);
        // check session for possible methods
    });

This is not only for http requests, check examples to see a simple example for
any type of session usage.