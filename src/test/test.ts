import { AssetHandle } from "../assetmgr";
import { ElImg } from "../components/img";
import { sACN2VideoCore } from "../sACN2VideoCore";
import img0 from "../../misc/test0.jpg";
import testmask from "../../misc/testmask.png";
import { sACN2VideoOverview } from "../overview.render";
import { mat3 } from "../glUtils";

async function init() {
    const cv = document.getElementById("canvas") as HTMLCanvasElement;
    const s2v = new sACN2VideoOverview(cv);
    s2v.setPrescaler(4);

    const imgSrc = new AssetHandle();
    imgSrc.data = img0;

    const img = new ElImg(s2v, "testbild", imgSrc);

    img.opacity = 1;

    const mask = new AssetHandle();

    s2v.masks.set("mask", {
        pos: mat3.scaling(.5, .5),
        src: mask,
    })

    mask.data = testmask;

}
window.addEventListener("load", init);
