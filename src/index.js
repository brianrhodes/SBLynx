const path = require('path')
const Net = require('net');
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const hbs = require('hbs')
const fs = require('fs')

const VERSION = "v0.01"
const COPYRIGHT = "(C)opyright 2021, Lynx System Developers, Inc."

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// The port on which the server is listening.
const port = process.env.port || 3000;
const rtv_port = 1950

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const rtv_server = new Net.Server();

// Define paths for express config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

let clockRun = false
let myVar = setInterval(clockTimer, 1000);
let clockCount = 0;
let g_rtv_socket = 0

var appOptions = {
    Layout: "",
    HomeTeam: "",
    HomeScore: "",
    AwayTeam: "",
    AwayScore: "",
    Time: ""
}

// Setup static directory to server
app.use(express.static(publicDirectoryPath))

app.get('', (req,res) => {
    // Load app Config
    try {
        var data = fs.readFileSync('./config.json'), 
        myObj;
        myObj = JSON.parse(data);
    }
    catch (err) {
        console.log('Error parsing config.json')
    }

    res.render('index', {
        version: VERSION,
        copyright: COPYRIGHT,
        Layout: myObj != undefined ? myObj.Layout : "",
        HomeTeam: myObj != undefined ? myObj.HomeTeam : "",
        HomeScore: myObj != undefined ? myObj.HomeScore : "0",
        AwayTeam: myObj != undefined ? myObj.AwayTeam : "",
        AwayScore: myObj != undefined ? myObj.AwayScore : "0",
        Time: myObj != undefined ? myObj.Time : "00:00"
    })
})

// For the running clock
function clockTimer() {
    if(clockRun) {
        if(g_rtv_socket) {
            let out_str = ""
        
            let minutes = 0
            minutes = Math.floor(clockCount / 60)
            let seconds = 0
            seconds = clockCount - (minutes * 60)
            out_str = "\x01T\x02" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + "\x05"
            out_str += "\x03\x04"
            console.log(out_str)
            g_rtv_socket.write(out_str)
        }
        if(clockCount > 0)
            clockCount--
    }
}

io.on('connection', (socket) => {
    console.log("New Websocket connection")

    socket.on('data', (data) => {
        let out_str = ""
        let layoutName = "VideoApp-" + data[0].layout
    
        out_str = "Command=LayoutDraw;Name=" + layoutName +";Clear-1;\x0A"
        out_str += "\x01R\x02" + data[1].team + "\x05" + data[2].team + "\x05" + data[1].score + "\x05" + data[2].score + "\x05"
        out_str += "\x03\x04"

        console.log(out_str)
        if(g_rtv_socket)
            g_rtv_socket.write(out_str)

        // Save App Info
        appOptions.Layout = data[0].layout
        appOptions.HomeTeam = data[1].team
        appOptions.HomeScore = data[1].score
        appOptions.AwayTeam = data[2].team
        appOptions.AwayScore = data[2].score
        appOptions.Time = data[3].time
        var data = JSON.stringify(appOptions);
  
        fs.writeFile('./config.json', data, function (err) {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                return;
            }
            console.log('Configuration saved successfully.')
        });
    })

    socket.on('startclock', (data) => {
        console.log("Starting Clock")
        clockRun = true
    })

    socket.on('stopclock', (data) => {
        console.log("Stopping Clock")
        clockRun = false
    })

    socket.on('setclock', (data) => {
        console.log("Resetting Clock: " + data[0].time)
        var parts = data[0].time.split(":")
        let minutes = parseInt(parts[0])
        let seconds = parseInt(parts[1])
        clockCount = (minutes * 60) + seconds

        out_str = "\x01T\x02" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + "\x05"
        out_str += "\x03\x04"
        if(g_rtv_socket)
            g_rtv_socket.write(out_str)

    })
})

 server.listen(port, () => {
     console.log('Server is up on port ' + port)
 })

//
// RESULTV SERVER
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
rtv_server.listen(rtv_port, function() {
    console.log('RTV Server listening for connection requests on socket localhost:${0}', rtv_port);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.
rtv_server.on('connection', function(rtv_socket) {
    console.log('A new connection has been established.');

    g_rtv_socket = rtv_socket
    // The server can also receive data from the client by reading from its socket.
    rtv_server.on('data', function(chunk) {
        let data = chunk.toString()
        console.log('Data received from client: ${0}', data);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    rtv_server.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    rtv_server.on('error', function(err) {
        console.log('Error: ${0}', err);
    });
});


