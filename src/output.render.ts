import { AssetHandle } from "./assetmgr";
import { MaskImg } from "./components/maskimg";
import { mat3 } from "./glUtils";
import { sACN2VideoCore } from "./sACN2VideoCore";

export class sACN2VideoOutput extends sACN2VideoCore {

    constructor(target: HTMLCanvasElement, width: number = 1920, height: number = 1080) {
        super(target, width, height);
        this.maskImg = new MaskImg(this, this.maskImgSrc);
    }

    protected renderMask(gl: WebGL2RenderingContext): void {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.lg.fbTex);
        gl.activeTexture(gl.TEXTURE2);
        this.maskImg.bindTex();

        gl.uniformMatrix3fv(this.getUniform("u_el_transform"), false, mat3.empty);
        gl.uniformMatrix3fv(this.getUniform("u_tex_transform"), false, mat3.empty);

        gl.uniform1i(this.getUniform("u_mode"), 2);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    readonly maskImgSrc = new AssetHandle();
    protected maskImg: MaskImg;
}
