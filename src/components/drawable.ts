import { mat3, undefinedMsg } from "../glUtils";
import { sACN2VideoCore } from "../sACN2VideoCore";
import { Elm } from "./elm";

export abstract class Drawable extends Elm {

    constructor(ctx: sACN2VideoCore) {
        super(ctx);
        const gl = ctx.ctx;
        this.tex = undefinedMsg(gl.createTexture(), "texture creation failed");
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    protected tex: WebGLTexture;

    public bindTex(bindPoint: number = this.ctx.ctx.TEXTURE_2D || 0) {
        const gl = this.ctx.ctx;
        gl.bindTexture(bindPoint, this.tex);
    }
    public opacity: number = 0;
    public getOpacity(): number {
        return this.opacity;
    }

    private elTransform: mat3 = mat3.empty;
    protected elTransforms: mat3[] = [];
    protected updatedElTransform() {
        this.elTransform = mat3.multiply(...this.elTransforms);
    }
    public getElTransform(): number[] {
        return this.elTransform;
    }

    private texTransform: mat3 = mat3.empty;
    protected texTransforms: mat3[] = [];
    protected updatedTexTransform() {
        this.texTransform = mat3.multiply(...this.texTransforms);
    }
    public getTexTransform(): number[] {
        return this.texTransform;
    }

}
