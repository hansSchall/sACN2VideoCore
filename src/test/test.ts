import { sACN2VideoCore } from "../sACN2VideoCore";

async function init() {
    const cv = document.getElementById("canvas") as HTMLCanvasElement;
    const s2v = new sACN2VideoCore(cv);
    s2v.setPrescaler(4);
}
window.addEventListener("load", init);
