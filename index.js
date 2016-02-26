"use strict";

let TPlayer = require('./modules/TPlayer');
let TGame = require('./modules/TGame')(TPlayer);

let io = require('socket.io')(3000);

io.on('connection', function (socket) {

    let player = new TPlayer(socket);

    socket.player = player;

    socket.on('update', e => {
        player.update(e);
    });

    socket.on('disconnect', () => {
        player.destruct();
    });
});
