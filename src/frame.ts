export class FrameCounter {

    #last = 0;

    constructor(public fps = 60) {

    }

    current() {
        const time = performance.now();
        const diff = time - this.#last;
        return 1000 / diff;
    }

    tick() {
        this.#last = performance.now();
    }
}