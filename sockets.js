const socket = require('socket.io');
let io;

const Socket = {
    emit: (event, data) => {
        console.log(event, data);
        io.sockets.emit(event, data);
    },
    emitSpecific: (client, event, data) => {
        console.log(client, event, data);
        io.to(client).emit(event, data);
    }
};


let clients = {};
exports.io = io;
exports.Socket = Socket;

exports.attach = (app) => {
    io = socket(app);

    io.on("connection", (socket) => {
        console.log("User connected - " + socket.id);
        clients[socket.id] = {
            // socket: socket,
            SocketId: socket.id,
            connectedSince: new Date()
        }
        console.log(clients);

        socket.on('hour', data => {
            console.log('la hora es: ');
            console.log(data);
        });

        socket.on('id', id => {
            clients[socket.id]['id'] = id;
            console.log('ID RECEIVED');
            console.log(clients[socket.id]);
        });

        socket.on('disconnect', () => {
            console.log(socket.id + ' disconnected');
            delete clients[socket.id];
            console.log(clients);
        });

    });
}

exports.getClientsWatchingId = (id) => {
    let watchers = [];
    Object.keys(clients).forEach(key => {
        console.log(clients[key]);
        console.log(clients[key]['id'], id);
        if(clients[key]['id'] == id){
            watchers.push(clients[key]);
        }
    });

    return watchers;
}