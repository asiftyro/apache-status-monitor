"use strict"
const _ = require('underscore');
const reqPromise = require('request-promise');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

const config = require('./config.json');

let status = require("./server-list.json");
status = _.sortBy((_.sortBy(status, 'Name')), 'Priority');

const echo = (i) => console.log(i);

const parseClientCount = (htmlString) => {
    var lines = htmlString.split('\n');
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].includes("currently being processed")) {
            var clientCountArr = lines[i]
                .replace("<dt>", "")
                .replace(" requests currently being processed", "")
                .replace(" idle workers</dt>", "")
                .replace(" ", "")
                .split(",");
            return parseInt(clientCountArr[0]) + parseInt(clientCountArr[1]);
        }; // end if "currently being processed"
    } // next line
}; // end func parseClientCount


const probe = () => {

    let reqArr = [];

    for (let k in status) {

        let reqOptions = {
            method: 'get',
            uri: status[k].URL,
            timeout: config.probeTimeoutMs,
        };

        let rp = reqPromise(reqOptions).then((cont) => {
            status[k].Load = parseClientCount(cont);
            status[k].LastResponse = new Date().toLocaleString();
            status[k].LastTry = status[k].LastResponse
            status[k].ProbeStatus = 'OK';
            io.emit('apache status', status);
        }).catch((err) => {
            status[k].Load = -1;
            if (err.statusCode)
                status[k].ProbeStatus = err.statusCode;
            else
                status[k].ProbeStatus = err.message;
            status[k].LastTry = new Date().toLocaleString();
            io.emit('apache status', status);
        });

        reqArr.push(rp);

    }; // next server

    Promise.all(reqArr).then(function(docs) {
        // io.emit('apache status', status);
        setTimeout(probe, config.probingIntervalMs);
    }).catch(function(er) {
        // io.emit('apache status', status);
        setTimeout(probe, config.probingIntervalMs);
    });

}; // end function probe


probe();

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));


app.engine('html', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)
    // this is an extremely simple template engine
    var rendered = content.toString()
      .replace('#requests_currently_being_processed#', options.val1)
      .replace('#idle_workers#', options.val2);
    return callback(null, rendered);
  });
});

app.set('views', './') // specify the views directory
app.set('view engine', 'html') // register the template engine
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(__dirname + '/client.html'));
app.get('/mock-status', (req, res) => res.render('apache_status_sample', { val1: getRandomInt(1000), val2: getRandomInt(1000) }));



http.listen(3000, () => console.log('Web server started at http://localhost:3000'));