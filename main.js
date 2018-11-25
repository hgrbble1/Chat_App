const electron = require('electron');
const url = require('url');
const path = require('path');
const dgram = require("dgram");
var PORT= 3334;
var HOST = '192.168.1.51';
var portSendTo = 3333;
var hostSendTo = '192.168.1.208';

const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = electron;

let mainWindow;

//Listen for app to be ready
app.on('ready', function() {
    //Create new mainWindow
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({width, height})
  // mainWindow = new BrowserWindow({
  //   width: auto,
  //   height: auto,
  // });
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

  startServer(PORT,HOST);


});

//Handle create add window
function createAddWindow(html){
//Create new mainWindow
addWindow = new BrowserWindow({
  width: 520,
  height: 300,
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

ipcMain.on('send:message', function(e, item){
  var message = new Buffer(item);

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, portSendTo, hostSendTo, function(err, bytes) {
  if (err) throw err;
  console.log('UDP message sent to ' + portSendTo + ":" + hostSendTo);
  client.close();
});

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

function startServer(port,host) {
  var server = dgram.createSocket('udp4');

  server.on('listening', function() {
    var address = server.address('udp4');
    console.log('UDP server listening on ' + address.address + ':' + address.port);
  });

  server.on('message', function(message, remote) {
  //ipcRenderer.send('listen:ForMessage', message);
  console.log(message);
    mainWindow.webContents.send('item:add', message);
  });

  server.bind(port, host);
};
