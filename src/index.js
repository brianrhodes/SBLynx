const path = require('path')
const Net = require('net');
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const hbs = require('hbs')
const fs = require('fs')

const VERSION = "v0.1b8"
const COPYRIGHT = "(C)opyright 2022, Lynx System Developers, Inc."

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
let clockDirection = 'down'
let myVar = setInterval(clockTimer, 1000);
let clockCount = 0;
let g_rtv_socket = 0

let appOptions = {
    Sport: "",
    HomeTeam: "",
	HomeColor: "",
    HomeScore: "",
    AwayTeam: "",
	AwayColor: "",
    AwayScore: "",
    SetPeriod: "",
    SetTime: "15:00",
    CurrentTime: "15:00",
    UpDown: "down"
}

// Setup static directory to server
app.use(express.static(publicDirectoryPath))

app.get('', (req,res) => {
    // Load app Config
    try {
        var data = fs.readFileSync('./config.json'), 
        myObj;
        myObj = JSON.parse(data);
        appOptions = myObj
    }
    catch (err) {
        // No config file - Save App Info
        appOptions.Sport = ""
        appOptions.HomeTeam = "Home Name"
		appOptions.HomeColor = "Blue"
        appOptions.HomeScore = "0"
        appOptions.AwayTeam = "Away Name"
		appOptions.AwayColor = "Red"
        appOptions.AwayScore = "0"
        appOptions.SetPeriod = "Q1"
        appOptions.SetTime = "15:00"
        appOptions.CurrentTime = "15:00"
        var data = JSON.stringify(appOptions);
        myObj = JSON.parse(data);

        fs.writeFile('./config.json', data, function (err) {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                return;
            }
            console.log('Configuration saved successfully.')
        });
    }
    
    res.render('index', {
        version: VERSION,
        copyright: COPYRIGHT,
        Sport: myObj != undefined ? myObj.Sport : "",
        HomeTeam: myObj != undefined ? myObj.HomeTeam : "",
		HomeColor: myObj != undefined ? myObj.HomeColor : "Blue",
        HomeScore: myObj != undefined ? myObj.HomeScore : "0",
        AwayTeam: myObj != undefined ? myObj.AwayTeam : "",
		AwayColor: myObj != undefined ? myObj.AwayColor : "Red",
        AwayScore: myObj != undefined ? myObj.AwayScore : "0",
        SetPeriod: myObj != undefined ? myObj.SetPeriod : "Q1",
        SetTime: myObj != undefined ? myObj.SetTime : "15:00",
        CurrentTime: myObj != undefined ? myObj.CurrentTime : "15:00"
    })
        
    if(myObj.CurrentTime == "0") {
        clockCount = 0
    }
    else {
        var parts = myObj.CurrentTime.split(":")
        let minutes = parseInt(parts[0])
        let seconds = parseInt(parts[1])
        clockCount = (minutes * 60) + seconds    
    }
})
// To initialize the display
function clearDisplay() {
    let out_str = ""

    if(g_rtv_socket) {
        out_str = "\x01V\x02" 
        out_str += "\x12LayoutSetup=1,1\x14"
        out_str += "\x12LayoutBackColor=0x55,0x00,0x9c\x14"
        out_str += "\x12ImageSetup=1\x14"
        out_str += "\x12ImageDraw=Mynx.tga\x14"
        out_str += "\x12LayoutFlush\x14\x05\x03\x04"
        console.log(out_str)
        g_rtv_socket.write(out_str)
    }
}

// For the running clock
function clockTimer() {

    if(clockRun) {
        let out_str = ""
        let minutes = 0
        minutes = Math.floor(clockCount / 60)
        let seconds = 0
        seconds = clockCount - (minutes * 60)

        if(g_rtv_socket) {
            out_str = "\x01V\x02" 
			out_str += "\x12LayoutSetup=16,8\x14"
			out_str += "\x12LayoutBackColor=0x20,0x20,0x20\x14"
			out_str += "\x12FontWidth=100,50\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontShadowSize=1\x14"
			out_str += "\x12TextJustify=Center\x14"
			out_str += "\x12TextMargins=20,20\x14"
			out_str += "\x12TextSetup=8,5,4,2\x14"
			out_str += "\x12FontFaceColor=Yellow\x14"
			out_str += "\x12TextDraw=" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + "\x14"
			out_str += "\x12TextMargins=2,2\x14"
			out_str += "\x12TextSetup=8,1,4,7\x14"
			out_str += "\x12FontFaceColor=Yellow\x14"
			out_str += "\x12TextDraw=" + appOptions.SetPeriod + "\x14"
            out_str += "\x12LayoutFlush\x14\x05\x03\x04"
            console.log(out_str)
            g_rtv_socket.write(out_str)
        }
        else {
            out_str = String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0')
            console.log(out_str)
        }

        if(clockDirection == "down") {
            if(clockCount > 0)
                clockCount--
        }
        else {
            clockCount++
        }
    }
}

io.on('connection', (socket) => {
    console.log("New Websocket connection")

    socket.on('send', (data) => {
        let out_str = ""

		    out_str = "\x01V\x02" 
			out_str += "\x12LayoutSetup=16,8\x14"
			out_str += "\x12LayoutBackColor=0x20,0x20,0x20\x14"
			out_str += "\x12FontWidth=100,50\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontShadowSize=1\x14"
			out_str += "\x12TextJustify=Center\x14"
			out_str += "\x12TextSetup=8,2,0,0\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontBackColor=" + ConvertColor(data[1].color) + "\x14"
			out_str += "\x12TextDraw=" + data[1].team + "\x14"
			out_str += "\x12TextSetup=4,6,0,2\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontBorderColor=" + ConvertColor(data[1].color) + "\x14"
			out_str += "\x12TextJustify=Right\x14"
			out_str += "\x12TextDraw=" + data[1].score + "\x14"
			out_str += "\x12TextSetup=8,2,8,0\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontBackColor=" + ConvertColor(data[2].color) + "\x14"
			out_str += "\x12TextDraw=" + data[2].team + "\x14"
			out_str += "\x12TextSetup=4,6,12,2\x14"
			out_str += "\x12FontFaceColor=White\x14"
			out_str += "\x12FontBorderColor=" + ConvertColor(data[2].color) + "\x14"
			out_str += "\x12TextJustify=Left\x14"
			out_str += "\x12TextDraw=" + data[2].score + "\x14"
            out_str += "\x12LayoutFlush\x14\x05\x03\x04"
			console.log(out_str)
            g_rtv_socket.write(out_str)


        console.log(out_str)
        if(g_rtv_socket)
            g_rtv_socket.write(out_str)

           SaveAppInfo(data)
    })

    socket.on('save', (data) => {
        SaveAppInfo(data)
    })

    socket.on('clear', (data) => {
        clearDisplay()
    })

    socket.on('startclock', (data) => {
        console.log("Starting Clock: " + data[3].UpDown)
        clockDirection = data[3].UpDown
        clockRun = true
        let minutes = Math.floor(clockCount / 60)
        let seconds = clockCount - (minutes * 60)
        data[3].CurrentTime = String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0')

        SaveAppInfo(data)
    })

    socket.on('stopclock', (data) => {
        console.log("Stopping Clock")
        clockRun = false

        let minutes = Math.floor(clockCount / 60)
        let seconds = clockCount - (minutes * 60)
        data[3].CurrentTime = String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0')
        SaveAppInfo(data)
    })

    socket.on('setclock', (data) => {
        console.log("Resetting Clock: " + data[3].SetTime)

        let minutes = 0
        let seconds = 0
        if(data[3].SetTime == "0") {
            clockCount = 0
        }
        else {
            var parts = data[3].SetTime.split(":")
            minutes = parseInt(parts[0])
            seconds = parseInt(parts[1])
            clockCount = (minutes * 60) + seconds
        }
        data[3].CurrentTime = data[3].SetTime    

        out_str = "\x01V\x02" 
        out_str += "\x12LayoutSetup=16,8\x14"
        out_str += "\x12LayoutBackColor=0x20,0x20,0x20\x14"
        out_str += "\x12FontWidth=100,50\x14"
        out_str += "\x12FontFaceColor=White\x14"
        out_str += "\x12FontShadowSize=1\x14"
        out_str += "\x12TextJustify=Center\x14"
        out_str += "\x12TextMargins=20,20\x14"
        out_str += "\x12TextSetup=8,5,4,2\x14"
        out_str += "\x12FontFaceColor=Yellow\x14"
        out_str += "\x12TextDraw=" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + "\x14"
        out_str += "\x12TextMargins=2,2\x14"
        out_str += "\x12TextSetup=8,1,4,7\x14"
        out_str += "\x12FontFaceColor=Yellow\x14"
        out_str += "\x12TextDraw=" + data[3].SetPeriod + "\x14"
        out_str += "\x12LayoutFlush\x14\x05\x03\x04"

        if(g_rtv_socket)
            g_rtv_socket.write(out_str)

        SaveAppInfo(data)
    })
    socket.on('setperiod', (data) => {
        console.log("Setting Period " + data[3].SetPeriod)

        let minutes = 0
        let seconds = 0
        if(data[3].SetTime == "0") {
            clockCount = 0
        }
        else {
            var parts = data[3].SetTime.split(":")
            minutes = parseInt(parts[0])
            seconds = parseInt(parts[1])
            clockCount = (minutes * 60) + seconds
        }
        
        out_str = "\x01V\x02" 
        out_str += "\x12LayoutSetup=16,8\x14"
        out_str += "\x12LayoutBackColor=0x20,0x20,0x20\x14"
        out_str += "\x12FontWidth=100,50\x14"
        out_str += "\x12FontFaceColor=White\x14"
        out_str += "\x12FontShadowSize=1\x14"
        out_str += "\x12TextJustify=Center\x14"
        out_str += "\x12TextMargins=20,20\x14"
        out_str += "\x12TextSetup=8,5,4,2\x14"
        out_str += "\x12FontFaceColor=Yellow\x14"
        out_str += "\x12TextDraw=" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + "\x14"
        out_str += "\x12TextMargins=2,2\x14"
        out_str += "\x12TextSetup=8,1,4,7\x14"
        out_str += "\x12FontFaceColor=Yellow\x14"
        out_str += "\x12TextDraw=" + data[3].SetPeriod + "\x14"
        out_str += "\x12LayoutFlush\x14\x05\x03\x04"

        if(g_rtv_socket)
            g_rtv_socket.write(out_str)

        SaveAppInfo(data)
    })
})

 server.listen(port, () => {
     console.log('Server is up on port ' + port)
 })

 function SaveAppInfo(data) {

    appOptions.Sport = data[0].sport
    appOptions.HomeTeam = data[1].team
	appOptions.HomeColor = data[1].color
    appOptions.HomeScore = data[1].score
    appOptions.AwayTeam = data[2].team
	appOptions.AwayColor = data[2].color
    appOptions.AwayScore = data[2].score
    appOptions.SetPeriod = data[3].SetPeriod
    appOptions.SetTime = data[3].SetTime
    appOptions.CurrentTime = data[3].CurrentTime
    appOptions.UpDown = data[3].UpDown
    var data = JSON.stringify(appOptions);

    fs.writeFile('./config.json', data, function (err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        console.log('Configuration saved successfully.')
    });
 }

 //Convert colors to RGB
 function ConvertColor(HexColor) {
    let ConvertedColor
    ConvertedColor = '0x' + HexColor[1] + HexColor[2] + ',0x' + HexColor[3] + HexColor[4] + ',0x' + HexColor[5] + HexColor[6]
    return ConvertedColor
}

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


