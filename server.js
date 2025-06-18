const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

const roomCodes={};
let currentCode = "// Start coding...\n";
app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current code when user joins
  socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      socket.roomId=roomId;
    if(roomCodes[roomId]) {
      socket.emit('codeUpdate', roomCodes[roomId]);
    } else {
       roomCodes[roomId] = "// Start coding...\n";
      socket.emit('codeUpdate', roomCodes[roomId]);
    }
  });
 

  // Receive code changes and broadcast to others
  socket.on('codeUpdate', (newCode) => {
   const roomId = socket.roomId;
   console.log(`Code update in room ${roomId}:`, newCode);
    if (!roomId) return;

    roomCodes[roomId] = newCode;
    socket.to(roomId).emit('codeUpdate', newCode);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
