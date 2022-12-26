import { AssetHandle } from "./assetmgr";
import { MaskImg } from "./components/maskimg";
import { mat3 } from "./glUtils";
import { sACN2VideoCore } from "./sACN2VideoCore";

export class sACN2VideoOverview extends sACN2VideoCore {

    protected renderMask(gl: WebGL2RenderingContext): void {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.lg.fbTex);
        gl.activeTexture(gl.TEXTURE2);
        gl.uniformMatrix3fv(this.getUniform("u_tex_transform"), false, mat3.empty);
        gl.uniform1i(this.getUniform("u_mode"), 3);
        gl.uniform1f(this.getUniform("u_opacity"), this.hiddenOpacity);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        for (let [id, { pos, src }] of this.masks) {
            let maskImg = this.maskImgs.get(src);
            if (!maskImg) {
                maskImg = new MaskImg(this, src);
                this.maskImgs.set(src, maskImg);
            }

            maskImg.bindTex();
            gl.uniformMatrix3fv(this.getUniform("u_el_transform"), false, pos);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

    }

    public hiddenOpacity = .4;

    public readonly masks = new Map<string, {
        pos: mat3,
        src: AssetHandle,
    }>();

    private maskImgs = new WeakMap<AssetHandle, MaskImg>();


}
