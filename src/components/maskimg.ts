import { AssetHandle } from "../assetmgr";
import { undefinedMsg } from "../glUtils";
import { sACN2VideoCore } from "../sACN2VideoCore";
import { ElImg } from "./img";

export class MaskImg extends ElImg {
    constructor(ctx: sACN2VideoCore, readonly src: AssetHandle) {
        super(ctx, "mask", src);
    }
}

