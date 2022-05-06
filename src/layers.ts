import * as Collisions from 'detect-collisions';
import type * as Types from './types';

export abstract class Layer {

    public position: Types.Vector2D;

    public renderQueue = true;

    constructor(public width: number, public height: number) {

        this.position = {
            x: 0,
            y: 0
        };
    }

    center() {
        this.position.x = (this.width / 2) * -1;
        this.position.y = (this.height / 2) * -1;

        return this;
    }

    render(context: CanvasRenderingContext2D) {
        throw Error('Abstract render method not overridden');
    }

    move(direction: Types.MoveDirection, distance = 1) {
        switch(direction) {
            case 'up':
                this.position.y -= distance;
                break;
            case 'down':
                this.position.y += distance;
                break;
            case 'left':
                this.position.x -= distance;
                break;
            case 'right':
                this.position.x += distance;
                break;
        }

        this.renderQueue = true;
    }
}

export class Sprite {

    public image;

    /**
     * Is sprite loaded
     */
    public ready = false;

    constructor(src: string, public width: number, public height: number) {
        this.image = new Image();
        this.image.src = src;
        this.image.width = width;
        this.image.height = height;

        this.image.onload = () => {
            this.ready = true;
        }
    }
}

export class Tile {

    constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}

    get width() {
        return this.x2 - this.x1;
    }

    get height() {
        return this.y2 - this.y1;
    }
}

export class SpriteTile extends Sprite {

    public tileIdx: number;

    constructor(src: string, public width: number, public height: number, public tiles: Tile[]) {
        super(src, width, height);

        this.tileIdx = 0;
    }
}

export class BaseMap extends Layer {
    constructor(public sprite: Sprite, public width: number, public height: number) {
        super(width, height);

        return this.center();
    }

    render(context: CanvasRenderingContext2D) {
        context.drawImage(this.sprite.image, this.position.x, this.position.y);
        this.renderQueue = false;
    }
}

export class Player extends Layer {

    public direction: Types.MoveDirection;
    
    #animationState: number;

    #directionSpriteIdx = new Map<Types.MoveDirection, number>([
        ['down', 0],
        ['left', 1],
        ['right', 2],
        ['up', 3]
    ]);

    constructor(public sprites: SpriteTile[], width: number, height: number) {
        super(width, height);

        this.direction = 'down';
        this.#animationState = 0;
    }

    render(context: CanvasRenderingContext2D) {
        context.drawImage(
            this.sprite.image, 
            this.tile.x1, 
            this.tile.y1, 
            this.tile.width, 
            this.tile.height, 
            this.position.x, this.position.y, 
            this.tile.width, 
            this.tile.height
        );

        this.renderQueue = false;
    }

    walk(direction: Types.MoveDirection) {
        if(this.#animationState < 3) {
            this.#animationState++;
        }
        else {
            this.#animationState = 0;
        }

        this.direction = direction;
        this.renderQueue = true;
    }

    get sprite() {
        const idx = this.#directionSpriteIdx.get(this.direction)!;

        return this.sprites[idx];
    }

    get tile() {
        const idx = this.#directionSpriteIdx.get(this.direction)!;

        return this.sprites[idx].tiles[this.#animationState];
    }
}