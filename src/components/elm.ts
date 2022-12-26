import { sACN2VideoCore } from "../sACN2VideoCore";

export abstract class Elm {
    constructor(readonly ctx: sACN2VideoCore, public readonly id: string) {
        if (id != "mask") {
            ctx.elms.set(this.id, this);
        }
    }

    public abstract bindTex(): void;
    public abstract getOpacity(): number;
    public abstract getElTransform(): number[];
    public abstract getTexTransform(): number[];

}
