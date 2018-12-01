# js_files_chatroom


Here is the template for our JSON objects sent back and forth:







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
    
}

packet ack
{
    packetType:'dataAck'
    fileName:
    numSegments
    ackNumber: 
}

