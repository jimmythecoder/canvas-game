import './style.css';

import { Sprite, BaseMap, SpriteTile, Player, Tile, Layer, FightArena } from './layers';
import { Controller } from './controller';
import { GameState } from './gamestate';
import { FrameCounter } from './frame';
import * as Collisions from 'detect-collisions';
import collisionMap from '../assets/collisionMap.json';
import { Vector2D } from './types';

const canvas = document.querySelector<HTMLCanvasElement>('#viewbox')!
const context = canvas.getContext('2d')!;
const startBtn = document.querySelector<HTMLButtonElement>('button#start')!
const stopBtn = document.querySelector<HTMLButtonElement>('button#stop')!
const fpsCounter = document.querySelector<HTMLSpanElement>('#fps')!
const gameState = new GameState();

/**
 * Config
 */
const settings = {
    moveDistance: 16
};

class MapSize {
    static width        = 3360;
    static height       = 1920;
    static tileWidth    = 48;
    static tileHeight   = 48;
    static columns      = MapSize.width / MapSize.tileWidth;
    static rows         = MapSize.height / MapSize.tileHeight;
}

class Wall extends Collisions.Box {
    constructor(vector: Vector2D, public index: number) {
        super(vector, MapSize.tileWidth, MapSize.tileHeight);
    }
}

class PlayerBox extends Collisions.Box {
    constructor(vector: Vector2D) {
        super(vector, MapSize.tileWidth, MapSize.tileHeight);
    }
}

class Door extends Collisions.Box {
    constructor(vector: Vector2D, public index: number) {
        super(vector, MapSize.tileWidth, MapSize.tileHeight);
    }

    /**
     * Opens the Door to a house
     */
    open() {
        console.log('Opening Door:', this.index);
    }
}

const CollisionBoxType = {
    Wall: 1,
    Door: 2
};

/**
 * Collision detection map
 */
const collisions = new Collisions.System();

collisionMap.forEach((tile, idx) => {
    if(tile) {
        const column    = idx % MapSize.columns;
        const row       = Math.floor(idx / MapSize.columns);
        const vector    = {x: MapSize.tileWidth * column, y: MapSize.tileHeight * row};

        switch(tile) {
            case CollisionBoxType.Wall:
                collisions.insert(new Wall(vector, idx));
                break;
            case CollisionBoxType.Door:
                collisions.insert(new Door(vector, idx));
                break;
            default:
                collisions.insert(new Collisions.Box(vector, MapSize.tileWidth, MapSize.tileHeight));
        }
    }
});

/**
 * Setup
 */
const FPS = new FrameCounter(60);
const controls = new Controller();
const layers: Layer[] = [];

/**
 * Load game assets
 */
const land = new BaseMap(
    new Sprite('/assets/map.png', MapSize.width, MapSize.height), 
    MapSize.width, 
    MapSize.height
).center();

const foreground = new BaseMap(
    new Sprite('/assets/foreground.png', MapSize.width, MapSize.height), 
    MapSize.width, 
    MapSize.height
).center();

const player = new Player(
    [
        new SpriteTile('/assets/playerDown.png', 192, 68, [
            new Tile(0, 0, 48, 68),
            new Tile(48, 0, 96, 68),
            new Tile(96, 0, 144, 68),
            new Tile(144, 0, 192, 68)
        ]),
        new SpriteTile('/assets/playerLeft.png', 192, 68, [
            new Tile(0, 0, 48, 68),
            new Tile(48, 0, 96, 68),
            new Tile(96, 0, 144, 68),
            new Tile(144, 0, 192, 68)
        ]),
        new SpriteTile('/assets/playerRight.png', 192, 68, [
            new Tile(0, 0, 48, 68),
            new Tile(48, 0, 96, 68),
            new Tile(96, 0, 144, 68),
            new Tile(144, 0, 192, 68)
        ]),
        new SpriteTile('/assets/playerUp.png', 192, 68, [
            new Tile(0, 0, 48, 68),
            new Tile(48, 0, 96, 68),
            new Tile(96, 0, 144, 68),
            new Tile(144, 0, 192, 68)
        ])
    ],
    192, 68
);

// Locate player infront of house door
player.position.x = 220;
player.position.y = 340;


const arena = new FightArena(150, 200);
arena.position.x = 400;
arena.position.y = 200;


layers.push(land);
layers.push(player);
layers.push(foreground);
//layers.push(arena);


function render() {
    if(!layers.filter(layer => layer.renderQueue).length) {
        return; // Nothing to render
    }

    layers.forEach((layer) => {
        layer.render(context);
    });
}

function getCollisions(playerPosition: Vector2D, landPosition: Vector2D) {

    const playerMapPosition = {
        x: Math.abs(landPosition.x) + playerPosition.x,
        y: Math.abs(landPosition.y) + playerPosition.y
    };

    const playerBox = new PlayerBox({x: playerMapPosition.x, y: playerMapPosition.y});

    return collisions.getPotentials(playerBox).filter((collider) => {
        return collisions.checkCollision(playerBox, collider);
    });
}

function main() {

    let key;

    if(key = controls.getLastKeyPress()) {

        let collisions: Collisions.TBody[] = [];

        switch(key) {
            case 'ArrowDown':
                collisions = getCollisions(player.position, {x: land.position.x, y: land.position.y - settings.moveDistance});

                if(!collisions.length) {
                    land.move('up', settings.moveDistance);
                    foreground.move('up', settings.moveDistance);
                }

                player.walk('down');
                break;
            case 'ArrowUp':
                collisions = getCollisions(player.position, {x: land.position.x, y: land.position.y + settings.moveDistance});

                if(!collisions.length) {
                    land.move('down', settings.moveDistance);
                    foreground.move('down', settings.moveDistance);
                }

                player.walk('up');
                break;
            case 'ArrowLeft':
                collisions = getCollisions(player.position, {x: land.position.x + settings.moveDistance, y: land.position.y});

                if(!collisions.length) {
                    land.move('right', settings.moveDistance);
                    foreground.move('right', settings.moveDistance);
                }

                player.walk('left');
                break;
            case 'ArrowRight':
                collisions = getCollisions(player.position, {x: land.position.x - settings.moveDistance, y: land.position.y});
                
                if(!collisions.length) {
                    land.move('left', settings.moveDistance);
                    foreground.move('left', settings.moveDistance);
                }

                player.walk('right');
                break;
        }

        console.log(collisions);

        collisions.forEach(collider => {
            if(collider instanceof Door) {
                collider.open();
            }
        });

        console.log('Collided with', collisions.map(collider => collider.constructor.name).join(', '));
    }

    render();

    requestAnimationFrame(() => {
        FPS.tick();

        if(gameState.isRunning) {
            main();
        }
    });
}

setInterval(() => {
    fpsCounter.innerText = Math.round(FPS.current()).toString();
}, 1000);

startBtn.onclick = () => {
    if(gameState.start()) {
        main();

        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
    }
};

stopBtn.onclick = () => {
    gameState.stop();

    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
};