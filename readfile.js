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
          // Depending on what type of file it is it will render differently on the screen
          data = JSON.parse(data);
          jsonData = data;
          console.log(data.messages[0].sent);
          for (i = 0; i < data.messages.length; i++ ) {
             console.log('inside the for loop');

             // if it is a messge and sent by you
             if (data.messages[i].type == 'image' && data.messages[i].sent === true ) {
               const li = document.createElement('li');
               const img = document.createElement('IMG');
               //var x = document.createElement("IMG");
               img.setAttribute("src", data.messages[i].message);
               img.setAttribute("width", "304");
               img.setAttribute("height", "228");
               img.setAttribute("alt", "An Image");
               //img.setAttribute("class", "circle");
               //document.body.appendChild(x);
               li.className = 'col s4 offset-s6 right-align sentMessage';
               //const itemText = document.createTextNode(item);
               li.appendChild(img);
               ul.appendChild(li);
             }// if it is a message and sent to you
             else if (data.messages[i].type == 'image' && data.messages[i].sent === false) {
               const li = document.createElement('li');
               const img = document.createElement('IMG');
               //var x = document.createElement("IMG");
               img.setAttribute("src", data.messages[i].message);
               img.setAttribute("width", "304");
               img.setAttribute("height", "228");
               img.setAttribute("alt", "An Image");
               //document.body.appendChild(x);
               li.className = 'col s4 offset-s3 left-align recMessage';
               //const itemText = document.createTextNode(item);
               li.appendChild(img);
               ul.appendChild(li);
             }
            //For the basic message
            else if (data.messages[i].sent === true ) {
              //ulsent.className = 'collection';
              const li = document.createElement('li');
              li.className = 'col s4 offset-s6 right-align sentMessage';
              const itemText = document.createTextNode(data.messages[i].message);
              li.appendChild(itemText);
              ul.appendChild(li);
            }
            else {
              //ulrec.className = 'collection';
              const li = document.createElement('li');
              li.className = 'col s4 offset-s3 left-align recMessage';
              const itemText = document.createTextNode(data.messages[i].message);
              li.appendChild(itemText);
              ul.appendChild(li);
            }
          }
          console.log(data);

      });
}

function updateHistory(data, newData, sent, type) {
  var hours = new Date();
  var minutes = new Date();
  console.log(data);
  var jsonObject = {
    "message": newData,
    "message-sent": `${hours.getHours()}:${minutes.getMinutes()}`,
    "sent": sent,
    "type": type
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
