module.exports = {
  init: function (server) {
    const io = require('socket.io')
    const listeningIo = io.listen(server, null)
    const listeningIoChat = listeningIo.of('/chat')
    listeningIoChat.on('connection', function (socket) {
      console.log('a user connected to chat')
      socket.on('customEmit', function (msg) {
        console.log('customEmit')
        listeningIoChat.emit('customEmit', msg)
      })
      socket.on('disconnect', function () {
        console.log('user disconnected')
      })
    })
  }
}
