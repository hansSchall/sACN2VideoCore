import { AssetHandle } from "../assetmgr";
import { mat3 } from "../glUtils";
import { sACN2VideoCore } from "../sACN2VideoCore";
import { Drawable } from "./drawable";

export class ElImg extends Drawable {
    constructor(ctx: sACN2VideoCore, id: string, readonly src: AssetHandle) {
        super(ctx, id);
        src.onUpdate.on(() => {
            this.img.src = src.data;
        })

        this.img.addEventListener("load", () => {
            this.updateTexSource(this.img);
        })

        src.onUpdate.emit();

        this.updatedElTransform();
    }

    protected updatedElTransform(transforms: mat3[] = []): void {
        super.updatedElTransform([
            ...transforms,
        ])
    }

    protected img = new Image();
}
