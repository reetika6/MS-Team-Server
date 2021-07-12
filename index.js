const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const history = []; // An array of objects to store the meeting id, sender's id, name and message 

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/",(req,res) =>{
  res.send("Server is running.");
  res.redirect('/${socket.id}');
});

app.post("/history", (req, res) => {
  const { meetingId, user } = req.body;
  io.sockets.sockets.get(user).join(meetingId);
  res.send(history.find(obj => obj.receiver === meetingId) || {});
})

io.on('connection', (socket) => {
  socketObject = socket;
  socket.emit('I',socket.id);
  socket.on('disconnect', () => {
    socket.broadcast.emit("callended");
  });

  socket.on('calluser',({userToCall, signalData,from,name}) =>{
    io.to(userToCall).emit('calluser',{signal:signalData,from,name});
  });

  socket.on("answercall",(data)=>{
    io.to(data.to).emit("callaccepted", data.signal);
  });

  socket.on("Message",(data)=>{
    const { receiver, senderId, senderName, message } = data;
    let isHistoryAvailable=false;
    for(let i=0;i<history.length;i++){
      if(receiver===history[i].receiver){
        history[i].texts.push({ senderId, senderName, message});
        isHistoryAvailable=true;
      }
    }
    if(!isHistoryAvailable){
      history.push({ receiver, texts:[{ senderId, senderName, message }]});
    }
    io.to(receiver).emit("recieved_message", { senderId, senderName, message, receiver });
    // console.log(history);
  });

});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
