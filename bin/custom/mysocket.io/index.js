const socketio = require('socket.io')
let io = null
module.exports = {
  init: function (server) {
    io = socketio(server, {origins: '*:*'})
    io.on('connection', function (socket) {
      console.log(`Client connected [id=${socket.id}], number of clients: ${module.exports.clientsConnected()}`)
      socket.on('SEND_MESSAGE', function (data) {
        console.log('SEND_MESSAGE:' + data)
        io.emit('MESSAGE', data)
      })
      socket.on('FIRST_CHOICE', function (data) {
        console.log('FIRST_CHOICE:' + data)
        io.emit('RECEIVED', data)
      })
    })
  },
  clientsConnected: function () {
    const srvSockets = io.sockets.sockets
    return Object.keys(srvSockets).length
  }
}
