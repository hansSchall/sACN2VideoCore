import { mat3 } from "../glUtils";
import { sACN2VideoCore } from "../sACN2VideoCore";
import { Drawable } from "./drawable";
import { Elm } from "./elm";

export class ElAudio extends Elm {
    constructor(ctx: sACN2VideoCore) {
        super(ctx);
    }

    public bindTex(): void {
        return
    }
    public getOpacity(): number {
        return 0
    }
    public getElTransform() {
        return mat3.empty
    }
    public getTexTransform() {
        return mat3.empty
    }

}
