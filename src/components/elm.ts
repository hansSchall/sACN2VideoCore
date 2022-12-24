import { sACN2VideoCore } from "../sACN2VideoCore";

export abstract class Elm {
    constructor(readonly ctx: sACN2VideoCore) {

    }

    public abstract bindTex(): void;
    public abstract getOpacity(): number;
    public abstract getElTransform(): number[];
    public abstract getTexTransform(): number[];

}
