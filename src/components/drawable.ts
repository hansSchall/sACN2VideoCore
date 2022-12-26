import { clone } from "lodash-es";
import { mat3, Pos, pos2mat3, undefinedMsg } from "../glUtils";
import { sACN2VideoCore } from "../sACN2VideoCore";
import { Elm } from "./elm";

export abstract class Drawable extends Elm {

    constructor(ctx: sACN2VideoCore, id: string) {
        super(ctx, id);
        const gl = ctx.ctx;
        this.tex = undefinedMsg(gl.createTexture(), "texture creation failed");
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

    protected position: Pos = {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
    }
    get pos() {
        return clone(this.position);
    }
    set pos(pos: Pos) {
        this.position = clone(pos);
        this.updatedElTransform();
    }

    private elTransform: mat3 = mat3.empty;
    protected updatedElTransform(transforms: mat3[] = []) {
        this.elTransform = mat3.multiply(pos2mat3(this.position), ...transforms);
    }
    public getElTransform(): number[] {
        return this.elTransform;
    }

    private texTransform: mat3 = mat3.empty;
    protected updatedTexTransform(transforms: mat3[] = []) {
        this.texTransform = mat3.multiply(pos2mat3(this.position), ...transforms);
    }
    public getTexTransform(): number[] {
        return this.texTransform;
    }

    protected updateTexSource(source: TexImageSource) {
        const gl = this.ctx.ctx;
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }

}
