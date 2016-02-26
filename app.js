var socket = io.connect(':3000');

var INPUT_POOL = [];

var USE_INTERPOLATION = false;
var SPEED = 200;
var TICKRATE = 8;
var INTERPOLATION = TICKRATE * 10;


var PlayerData = {
    x: 0,
    y: 0,
    rotation: 0,
    barrel_angle: 0
};

function render(entity, attributes, interpolation) {
    attributes = attributes || {};
    interpolation = interpolation !== void(0) ? interpolation : false;

    var attr = $.extend({}, attributes);

    entity.cancelTween(attr);

    if (interpolation) {
        entity.tween(attr, INTERPOLATION);
        entity.barrel.cancelTween();
        entity.barrel.tween({rotation: attr.barrel_angle}, INTERPOLATION);
    }
    else {
        entity.attr(attr);
        entity.barrel.rotation = attr.barrel_angle;
    }
}

function update(packet, deltaTime) {
    if (packet.W) {
        PlayerData.y -= SPEED * deltaTime;
        PlayerData.rotation = 0;
    }

    if (packet.S) {
        PlayerData.y += SPEED * deltaTime;
        PlayerData.rotation = 180;
    }

    if (packet.A) {
        PlayerData.x -= SPEED * deltaTime;
        PlayerData.rotation = -90;

        if (packet.S)
            PlayerData.rotation -= 45;

        if (packet.W)
            PlayerData.rotation += 45;
    }

    if (packet.D) {
        PlayerData.x += SPEED * deltaTime;
        PlayerData.rotation = 90;

        if (packet.S)
            PlayerData.rotation += 45;

        if (packet.W)
            PlayerData.rotation -= 45;
    }

    PlayerData.barrel_angle = packet.ANGLE;
}

function getPacket() {
    var currentTime = +new Date();
    var deltaTime = (currentTime - _time) / 1000;
    _time = currentTime;

    var angle = (new Crafty.math.Vector2D(Player.x - Input.MouseX, Player.y - Input.MouseY)).angleTo(new Crafty.math.Vector2D(1, 0));
    console.log(angle);
    return {
        DELTATIME: deltaTime,
        ANGLE: (angle / Math.PI * 180) + 90,
        SPACE: Input.isDown(Crafty.keys.SPACE),
        W: Input.isDown(Crafty.keys.W),
        A: Input.isDown(Crafty.keys.A),
        S: Input.isDown(Crafty.keys.S),
        D: Input.isDown(Crafty.keys.D)
    };
}

Crafty.init();

Crafty.sprite(16, 50, 'assets/Tanks/barrelBeige.png', {
    'Barrel': [0, 0]
});

Crafty.sprite(75, 70, 'assets/Tanks/tankBeige.png', {
    'Tank': [0, 0]
});


function createPlayer(id) {
    var player_entity = Crafty.e('2D, Canvas, Tween, Tank').attr({x: 0, y: 0, w: 75, h: 70}).origin('center center');
    var barrel_entity = Crafty.e('2D, Canvas, Tween, Barrel').attr({x: 29, y: -10, w: 16, h: 50}).origin('bottom center');
    player_entity.attach(barrel_entity);
    player_entity.barrel = barrel_entity;

    return player_entity;
}

var Input = Crafty.e('Keyboard, Mouse');
var Player = createPlayer('local');

Crafty.addEvent(Player, Crafty.stage.elem, "mousemove", function(e) {
    Input.MouseX = e.realX;
    Input.MouseY = e.realY;
});

var _time = +new Date();

setInterval(function () {
    var packet = getPacket();
    update(packet, packet.DELTATIME);
    render(Player, PlayerData, USE_INTERPOLATION);
    socket.emit('update', packet);
}, 1000 / TICKRATE);
