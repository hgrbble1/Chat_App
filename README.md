# Instructions to run


to run this program, you must have Node.js and NPM (node package manager) installed. 

to start it, cd into the directory, then run:
 npm install
 npm start


 our presentation is in the main directory, called Mustache Messaging Presentation, and the paper is called Mustache Messaging Project Report

note: the ip addresses entered only seem to work if they are on the same network


## other info
Here are the templates for our JSON objects sent back and forth:
Handshake init
{
    packetType: 'handshakeInit'
    filetype: (text, file, or image),
    fileName:
    numSegments:,

}
Handshake ack
{
    packetType:'handshakeAck'
    fileName:
    numSegments: 
    
}

Packet send
{
    packetType:  'data'
    filetype: (text, file, or image),
    fileName:
    numSegments: 10,
    segmentNumber: 
    data:
    
}

packet ack
{
    packetType:'dataAck'
    fileName:
    numSegments
    ackNumber: 
}

