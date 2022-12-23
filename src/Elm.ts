export abstract class Elm {
    constructor() {

    }

    public abstract bindTex(): void;
    public abstract getOpacity(): number;
    public abstract getElTransform(): number[];
    public abstract getTexTransform(): number[];

}
