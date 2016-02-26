"use strict";

let UUID = require('node-uuid');

class TPlayer {

    get index() {
        return this[TPlayer.indexKey];
    }

    constructor(socket) {
        this.id = UUID.v1();
        this.sid = socket.id;
        this.ip = socket.request.connection.remoteAddress;
        this.socket = socket;

        TPlayer.add(this);
    }

    destruct() {
        TPlayer.remove(this);
    }
}

TPlayer.list = {};
TPlayer.count = 0;

TPlayer.indexKey = 'ip';

TPlayer.findOrCreate = function (socket) {
    return TPlayer.findByIndex(socket.request.connection.remoteAddress) || new TPlayer(socket);
};

TPlayer.findByIndex = function (index) {
    return typeof TPlayer.list[index] != 'undefined' ? TPlayer.list[index] : null;
};

TPlayer.add = function (player) {
    if (typeof TPlayer.list[player[TPlayer.indexKey]] == 'undefined')
        TPlayer.count++;
    TPlayer.list[player[TPlayer.indexKey]] = player;
};

TPlayer.remove = function (player) {
    if (typeof TPlayer.list[player[TPlayer.indexKey]] == 'undefined')
        return true;
    TPlayer.list[player[TPlayer.indexKey]] = void(0);
    delete TPlayer.list[player[TPlayer.indexKey]];
    return true;
};

module.exports = TPlayer;
