import { sACN2VideoCore } from "../sACN2VideoCore";
import { Drawable } from "./drawable";

export class ElVideo extends Drawable {

    constructor(ctx: sACN2VideoCore, id: string) {
        super(ctx, id);
    }
}
