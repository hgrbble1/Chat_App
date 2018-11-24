const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

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

});

//Handle create add window
function createAddWindow(html){
//Create new mainWindow
addWindow = new BrowserWindow({
  width: 300,
  height: 200,
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
