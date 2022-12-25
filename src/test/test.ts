import { AssetHandle } from "../assetmgr";
import { ElImg } from "../components/img";
import { sACN2VideoCore } from "../sACN2VideoCore";
import img0 from "../../misc/test0.jpg";

async function init() {
    const cv = document.getElementById("canvas") as HTMLCanvasElement;
    const s2v = new sACN2VideoCore(cv);
    s2v.setPrescaler(4);

    const imgSrc = new AssetHandle();
    imgSrc.data = img0;

    const img = new ElImg(s2v, imgSrc);

    img.opacity = 1;

    s2v.elms.set("testbild", img);
}
window.addEventListener("load", init);
