import type * as Types from './types';

export class Controller {

    buffer: KeyCode[];
    #keys = ['ArrowUp' , 'ArrowDown' , 'ArrowLeft' , 'ArrowRight' , 'KeyW' , 'KeyA' , 'KeyS' , 'KeyD' , 'Space' , 'Escape' , 'Enter'] as KeyCode[];

    constructor() {
        addEventListener('keydown', (event) => {
            this.onKeyDown(event.code as KeyCode);
        });

        this.buffer = [];
    }

    onKeyDown(keyCode: KeyCode) {
        if(this.#keys.includes(keyCode)) {
            this.buffer.push(keyCode);
        }
    }

    getLastKeyPress() {
        return this.buffer.pop();
    }
}

export type KeyCode = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'Space' | 'Escape' | 'Enter';