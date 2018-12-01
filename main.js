const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = electron;
//import { app } from("electron";
const url = require('url');
const path = require('path');
const dgram = require("dgram");
var PORT= 3334;
var HOST = '192.168.1.51';
var portSendTo = 3333;
//var hostSendTo = '10.102.109.159'; //hudson's ip
var hostSendTo = '192.168.1.51';
var fileName_for_files_to_be_stored;
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');



let mainWindow;

//Listen for app to be ready
app.on('ready', function() {
    //Create new mainWindow
  mainWindow = new BrowserWindow({});
    //Load html into Window
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol:'file',
      slashes: true
    }));

    // Quit app when closed
    mainWindow.on('closed', function(){
      app.quit();
    });

    // Build menu from mainMenuTemplate
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

  //startServer(PORT,HOST);

});

//Handle create add window
function createAddWindow(html){
//Create new mainWindow
addWindow = new BrowserWindow({
  width: 420,
  height: 300,
  title: 'Add Shopping List item'
});
// Load html into window
addWindow.loadURL(url.format({
  pathname: path.join(__dirname, html),
  protocol:'file:',
  slashes: true
}));
// Garbage collection Handle
addWindow.on('close', function(){
  addWindow = null;
});
}
// This is where all ipcMain.on functions will be at
//This is for the file upload;
ipcMain.on('file:upload', function(e, filepath, fileName){
  console.log('file upload');
  // fs.writeFileSync("files/" + fileName, filepath, function(err) {
  //   if(err) {
  //     return console.log(err);
  //   };
    //console.log('The file was saved');

    fileName_for_files_to_be_stored = fileName;
    console.log(fileName_for_files_to_be_stored);
    mainWindow.webContents.send('item:add', fileName+"has been sent");
    sendHandshakeInit(filepath, 'file', 3333, hostSendTo);
    addWindow.close();

});

//this is for image:upload
ipcMain.on('image:upload', function(e, filepath, fileName){
  console.log('file upload');
  // fs.writeFileSync("files/" + fileName, filepath, function(err) {
  //   if(err) {
  //     return console.log(err);
  //   };
    //console.log('The file was saved');

    fileName_for_files_to_be_stored = fileName;
    console.log(fileName_for_files_to_be_stored);
    mainWindow.webContents.send('image:sent', filepath);
    sendHandshakeInit(filepath, 'image', 3333, hostSendTo);
    addWindow.close();

});

// This is for the send text message
ipcMain.on('send:message', function(e, item){
  //var message = new Buffer(item);
  fs.writeFileSync("lastMessage.txt", item, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
  fileName='lastMessage.txt';
  sendHandshakeInit(fileName, 'message', 3333, hostSendTo);
// var client = dgram.createSocket('udp4');
// client.send(message, 0, message.length, portSendTo, hostSendTo, function(err, bytes) {
//   if (err) throw err;
//   console.log('UDP message sent to ' + portSendTo + ":" + hostSendTo);
//   client.close();
// });

});

ipcMain.on('listen:ForMessage', function(e, item){
  mainWindow.webContents.send('item:add', item);

});

const mainMenuTemplate = [
  {
    label: 'File',
    submenu:[
      {
        label: 'Upload File',
        click(){
          createAddWindow('uploadFile.html');
        }
      },
      {
        label: 'Upload Picture',
        click(){
          createAddWindow('uploadPicture.html');
        }
      },
      {
        label:'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }

];

// If mac, add empty object to Menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
        focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });

}




//#####################################################################################################################################################//#
//#####################################################################################################################################################//#

var fss = require('fs-slice');
var fs = require('fs');
var N = 5; //the size of the window
var sending = {};
var receiving = {};
var windowStart = 1; //the first number of the window
//var packets_received; // stores the data we receive
var packets_toSend =['UNINITIALIZED']; //contains the packets of data in file form.
//var ackToSend = 0; //an integer containing the hight packet we have received, or in other words, the ack to send if we receive another packet
var MY_PORT = 3333;
var MY_HOST= '192.168.1.51';
var TARGETS = [{port:3334, address: '192.168.1.51'}]; //hudson
//var TARGETS = [{port:3333, address: '10.102.52.193'}, {port:3334, address: '10.102.52.193'}, {port:3335, address: '10.102.52.193'}];
//var TARGETS = [{port:3333, address: '10.102.52.193'}];
var writeToConsole = false;
var timer;
var timeout = 1000; //default timeout is 1 second
var drop_packets = false;
var BLOCKSIZE = 5000;
var client = dgram.createSocket('udp4');
client.bind(MY_PORT, MY_HOST);







function sendHandshakeInit(fileName, fileType, port, host) {
    console.time("send");
    var fsImage = fss(fileName);
    console.log(fileName);

    var Buffer = require('buffer').Buffer;
    var chunks = require('buffer-chunks');
    var files = Buffer.from(fs.readFileSync(fileName));
    files = chunks(files, BLOCKSIZE);


    //console.log("files: " + files);
    for (let target of TARGETS) {
        var handshake = {packetType: 'handshakeInit', fileName: (fileName + JSON.stringify(target)), fileType: fileType, numSegments:files.length};
        handshake = Buffer.from(JSON.stringify(handshake));
        packets_toSend = new Array(files.length);
        var i = 0;
        for (let file of files) {
                data = file;
                var packet =    {
                packetType: 'data',
                fileType: fileType,
                fileName: fileName + JSON.stringify(target),
                numSegments: files.length,
                segmentNumber: i+1,
                data: data
                };
                //console.log("slice = " + file.toString());
                packets_toSend[i] = Buffer.from(JSON.stringify(packet));
                i+=1;
            }
        sending[fileName + JSON.stringify(target)] = {windowStart:1, packets_toSend: packets_toSend, timer: undefined}
        client.send(handshake, 0, handshake.length, target.port, target.address, function(err, bytes) {
            console.log("Sent handshake to: " + target.address + ":" + target.port + handshake.toString());
        });
    }


}


function sendHandshakeAck(message, remote) {
    //message is already a JSON

    //If the packets recieved is a file store it in the file path.
    if (message.fileType == 'file') {
        receiving[message.fileName].stream = fs.createWriteStream("files/" + fileName_for_files_to_be_stored, {flags:'a'});
        //fs.writeFile("files/" + fileName_for_files_to_be_stored, data, function(err) {
    }

    //If the packets recieved is an image store it in the images.
    else if (message.fileType == 'image') {
        receiving[message.fileName].stream = fs.createWriteStream("images/" + fileName_for_files_to_be_stored, {flags:'a'});
    }
    var handshakeAck = {packetType : 'handshakeAck', fileName: message.fileName, numSegments: message.numSegments};
    handshakeAck = Buffer.from(JSON.stringify(handshakeAck));

    client.send(handshakeAck, 0, handshakeAck.length, remote.port, remote.address, function(err, bytes) {
        if (err) throw err;
        console.log('UDP handshake ack sent to ' + remote.address + ":" + remote.port);
    });


}

function reassembleFile(packets_received, fileType) {
    console.log("We got the whole file! reassembling....");
    if (fileType == 'message') {
        //ipcMain.send('listen:ForMessage', data.toString());

        var data = Buffer.from("");
        packetData = new Array(packets_received.length);
        for (i=0; i < packets_received.length; i++) {
            packetData[i] = Buffer.from(packets_received[i].data);
        }
        data = Buffer.concat(packetData);
        mainWindow.webContents.send('item:add', data.toString());
    }


    else if (fileType == 'file') {
        mainWindow.webContents.send("item:add", 'You just received a file in your chat_app directory files\\' + fileName_for_files_to_be_stored);
        console.log("The file was saved!");
    }
    else if (fileType == 'image'){
        mainWindow.webContents.send("item:add", 'You just received a file in your chat_app directory images\\' + fileName_for_files_to_be_stored);
        console.log("The file was saved!");
    }

    //If packets recieved is a text file do not write it just send it to the document

    console.timeEnd("receive")
}


    //TODO: write data to screen


//}


//args: timedout is a boolean, indicating if this was triggered by a timeout.
function sendWindow(remote, message) {
    //remote is the people who sent us the handshake ack
    if (sending[message.fileName].windowStart == sending[message.fileName].packets_toSend.length +1) {
        console.log("received all acks! closing...");
        return;
    }

    console.log("NOW SENDING WINDOW");
    //cancel any old timers that may be running.
    clearTimeout(sending[message.fileName].timer);
    //resend the packets in the window
    for (i = sending[message.fileName].windowStart-1; i < sending[message.fileName].windowStart+N-1 && i < sending[message.fileName].packets_toSend.length; i++) {
        console.log("i=" + i);
        client.send(sending[message.fileName].packets_toSend[i], 0,
            sending[message.fileName].packets_toSend[i].length, remote.port, remote.address, function(err, bytes) {
            console.log("Sent packet to " +  remote.address + ":" + remote.port);
        }); //send packet number i
    }
    //set a timer, to call this function again if we don't
    sending[message.fileName].timer = setTimeout(sendWindow, timeout, remote, message);

}
client.on('listening', function() {
    var address = client.address('udp4');
    console.log('UDP Server listening on ' + address.address + ":" + address.port);

  });


//#######################################################################################################################
//#######################################################################################################################
client.on('message', function(message, remote) {
    message = JSON.parse(message.toString());
    if (writeToConsole){
        console.log("received packet from " + remote.address + ':' + remote.port + ': ' + JSON.stringify(message));
    }
    //RECEIVED HANDSHAKE INIT:
    if (message.packetType == 'handshakeInit') {

        console.time("receive")
        receiving[message.fileName] = {packets_received: new Array(message.numSegments), ackToSend: 0, stream: undefined};
        sendHandshakeAck(message, remote);
    }

    //RECEIVED HANDSHAKE ACK
    if (message.packetType == 'handshakeAck') {
        //start Go-Back-N
        acks_received = null;
        sendWindow(remote, message);
    }


    //RECEIVED DATA
    if (message.packetType == 'data') {

        //send an acknowledgement, add it to our packets_received
        console.log("we received a data packet");
        //if it's the right packet, increment the ackToSend

        if (message.segmentNumber == receiving[message.fileName].ackToSend + 1) {
            if (Math.floor(Math.random() * 10) != 9 || !drop_packets) {
                receiving[message.fileName].ackToSend = message.segmentNumber;
                console.log("INCREASING ACK");
                var percentage = (message.ackNumber/message.numSegments) * 100 + '%'
                console.log(percentage, "percantage");
                mainWindow.webContents.send('progress-received:update', percentage);

                if (message.fileType != 'message') {
                    receiving[message.fileName].stream.write(Buffer.from(message.data));
                }
                else {
                    receiving[message.fileName].packets_received[receiving[message.fileName].ackToSend - 1] = message
                }
            }
            else {
                console.log("DROPPED PACKET");
            }
        }
        var ack = {packetType: "dataAck", fileName: message.fileName, numSegments: message.numSegments, ackNumber: receiving[message.fileName].ackToSend};
        ack = Buffer.from(JSON.stringify(ack));
        client.send(ack, 0, ack.length, remote.port, remote.address, function(err, bytes) {
            console.log("sent an ack");
        });

        //if we have all packets, reassemble to the file and update the progress bar
        if (receiving[message.fileName].ackToSend == message.numSegments) {

              mainWindow.webContents.send('progress-received:done', '100%');
            reassembleFile(receiving[message.fileName].packets_received, message.fileType);

        }
    }

    //RECEIVED PACKET ACK
    if (message.packetType == 'dataAck') {
        //add it to the acks received; adjust window
             if (message.ackNumber == message.numSegments) {
                //all acks have been received; stop the timer and stop
                mainWindow.webContents.send('progress:done', '100%');
                console.log("We got all acks - file successfully sent!");
                console.timeEnd("send");
                clearTimeout(sending[message.fileName].timer);
            } else if (message.ackNumber >= sending[message.fileName].windowStart) {
              ///Show the progress bar an update interval
              var percentage = (message.ackNumber/sending[message.fileName].packets_toSend.length) * 100 + '%'
              mainWindow.webContents.send('progress:update', percentage);

                //Now we must adjust the window
                sending[message.fileName].windowStart = message.ackNumber + 1;
                console.log("Window now starts at " + sending[message.fileName].windowStart);
                //send the next packet
                if (sending[message.fileName].windowStart + N - 2 < sending[message.fileName].packets_toSend.length) {
                    console.log("sending packet "  + (sending[message.fileName].windowStart + N - 1) + "/" + message.numSegments);
                    for (let target of TARGETS) {
                        client.send(sending[message.fileName].packets_toSend[sending[message.fileName].windowStart + N - 2], 0,
                            sending[message.fileName].packets_toSend[sending[message.fileName].windowStart + N - 2].length, remote.port, remote.address, function(err, bytes) {
                            console.log("Sent packet to " +  remote.address + ":" + remote.port);
                        });
                    }
                    clearTimeout(sending[message.fileName].timer);
                    console.log("Setting another timer, cleared Timeout...");
                    sending[message.fileName].timer = setTimeout(sendWindow, timeout, remote, message);
                }
                //update app to show progress of file recieved
            }
        }
});

//sendHandshakeInit(FILENAME, 'text', TARGET_PORT, TARGET_HOST);


//#####################################################################################################################################################//#
//#####################################################################################################################################################//#
// function startServer(port,host) {
//   var server = dgram.createSocket('udp4');
//
//   server.on('listening', function() {
//     var address = server.address('udp4');
//     console.log('UDP server listening on ' + address.address + ':' + address.port);
//   });
//
//   server.on('message', function(message, remote) {
//   //ipcRenderer.send('listen:ForMessage', message);
//   console.log(message);
//     mainWindow.webContents.send('item:add', message);
//   });
//
//   server.bind(port, host);
// };
