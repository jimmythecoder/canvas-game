export class GameState {

    isRunning = false;

    constructor() {

    }

    start() {
        if(!this.isRunning) {
            this.isRunning = true;

            return true;
        }

        return false;
    }

    stop() {
        if(this.isRunning) {
            this.isRunning = false;
            return true;
        }
        else {
            return false;
        }
    }
}