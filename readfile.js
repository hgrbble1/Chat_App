var app = require('electron').remote;
var dialog = app.dialog;
var fs = require('fs');
//var fileName2 = 'history2.json';
document.addEventListener("DOMContentLoaded", loadPreviousTextHistory);
console.log('coming from readfile.js');
function loadPreviousTextHistory(e) {
  e.preventDefault();
  console.log('I am right here');
  var fileName = 'history.json';
  var filepath = 'history.json'

  // dialog.showOpenDialog((fileName) => {
  //   if(fileName === undefined){
  //     console.log("No file selected");
  //     return;
  //   }

      fs.readFile(filepath, 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
          }
          // Change how to handle the file content\
          data = JSON.parse(data);
          jsonData = data;
          console.log(data.messages[0].sent);
          for (i = 0; i < data.messages.length; i++ ) {
             console.log('inside the for loop');
            if (data.messages[i].sent === true ) {
              ulsent.className = 'collection';
              const li = document.createElement('li');
              li.className = 'collection-item';
              const itemText = document.createTextNode(data.messages[i].message);
              li.appendChild(itemText);
              ulsent.appendChild(li);
            }
            else {
              ulrec.className = 'collection';
              const li = document.createElement('li');
              li.className = 'collection-item';
              const itemText = document.createTextNode(data.messages[i].message);
              li.appendChild(itemText);
              ulrec.appendChild(li);
            }
          }
          console.log(data);

      });
}

function updateHistory(data, newData, sent) {
  var hours = new Date();
  var minutes = new Date();
  console.log(data);
  var jsonObject = {
    "message": newData,
    "message-sent": `${hours.getHours()}:${minutes.getMinutes()}`,
    "sent": sent
  }
  data.messages.push(jsonObject);
  console.log("new Data object", data)
  jsonData = data;
  //stringData = JSON.stringify(data);
  // fs.writeFile(fileName2, stringData, (err) => {
  //       if(err){
  //           alert("An error ocurred creating the file "+ err.message)
  //       }
  //
  //       alert("The file has been succesfully saved");
  //   });

};
