import { Elm } from "./components/elm";
import { compileShader, mat3, undefinedMsg } from "./glUtils";
import vertexCode from "./shader/vertex.shader";
import fragmentCode from "./shader/fragment.shader";

export class sACN2VideoCore {
    constructor(readonly target: HTMLCanvasElement, width: number = 1920, height: number = 1080) {
        this.setCvSize(width, height);
        const ctx = target.getContext("webgl2") || undefined;
        if (!ctx) {
            throw new Error("no WebGL");
        } else {
            this.ctx = ctx;
        }
        this.initGL().then(this.runRender.bind(this));
        setInterval(() => {
            this.onFps?.(this.fps * 2);
            this.fps = 0;
        }, 500);
    }

    public onFps: (fps: number) => void = () => { };

    public setCvSize(w: number, h: number) {
        this.target.width = w;
        this.target.height = h;
    }

    public getCvSize(): [number, number] {
        return [this.target.width, this.target.height];
    }

    readonly ctx: WebGL2RenderingContext;
    /// @ts-expect-error
    private lg: {
        pr: WebGLProgram,
        objPosLoc: number,
        objPosBuf: WebGLBuffer,
        fb: WebGLFramebuffer,
        fbTex: WebGLTexture,
        maskTex: WebGLTexture,

    };
    readonly elms = new Map<string, Elm>();
    private renderorder: string[] = [];
    private rendertime: number[] = [];
    public setPrescaler(prescaler: number) {
        this.prescaler = prescaler;
    }

    private prescaler = 1;
    private prescaleCounter = 1;
    private fps = 0;
    private readonly uniforms = new Map<string, WebGLUniformLocation>();
    private frameBufferSize = [window.screen.height, window.screen.width];

    private getUniform(name: string) {
        return undefinedMsg(this.uniforms.get(name), `'${name}' was not resolved during lookup`)
    }

    private async initGL() {
        const gl = this.ctx;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const program = compileShader(gl, vertexCode, fragmentCode);
        gl.useProgram(program);

        console.log(`%c created WebGL shaders`, "color: #0f0");

        [
            "t_texture",
            "t_fbTex",
            "t_mask",
            "u_mode",
            "u_zind",
            "u_opacity",
            "u_eTL",
            "u_eTR",
            "u_eBL",
            "u_eBR",
            "u_el_transform",
            "u_tex_transform",
        ]
            .forEach(uname => this.uniforms.set(uname, undefinedMsg(gl?.getUniformLocation(program, uname), `failed to resolve uniform ${uname}`)));
        this.lg = {
            objPosLoc: gl.getAttribLocation(program, "a_objectPos"),
            objPosBuf: undefinedMsg(gl.createBuffer(), "buffer creation failed"),
            fb: undefinedMsg(gl.createFramebuffer(), "framebuffer creation failed"),
            fbTex: undefinedMsg(gl.createTexture(), "texture creation failed"),
            maskTex: undefinedMsg(gl.createTexture(), "texture creation failed"),
            pr: program
        }

        gl.bindTexture(gl.TEXTURE_2D, this.lg.fbTex);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 100, 50, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBufferSize[1], this.frameBufferSize[0], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, this.lg.maskTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lg.fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.lg.fbTex, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.uniform1i(this.getUniform("t_texture"), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.lg.fbTex);
        gl.uniform1i(this.getUniform("t_fbTex"), 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.lg.maskTex);
        gl.uniform1i(this.getUniform("t_mask"), 2);
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(this.getUniform("u_mode"), 0);
        gl.uniform1f(this.getUniform("u_zind"), 0);
        gl.uniform2f(this.getUniform("u_eTL"), 0, 0);
        gl.uniform2f(this.getUniform("u_eTR"), 1, 0);
        gl.uniform2f(this.getUniform("u_eBL"), 0, 1);
        gl.uniform2f(this.getUniform("u_eBR"), 1, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lg.objPosBuf);
        gl.vertexAttribPointer(this.lg.objPosLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.lg.objPosLoc);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.lg.texPosBuf);
        // gl.vertexAttribPointer(this.lg.texPosLoc, 2, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(this.lg.texPosLoc);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    private runRender() {
        requestAnimationFrame(this.render.bind(this));
    }

    private render() {
        if (this.prescaleCounter < this.prescaler) {
            this.prescaleCounter++;
            this.runRender();
            return;
        }

        this.prescaleCounter = 1;

        const renderstart = performance.now();

        const gl = this.ctx;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.uniformMatrix3fv(this.getUniform("u_el_transform"), false, mat3.empty);
        gl.uniformMatrix3fv(this.getUniform("u_tex_transform"), false, mat3.empty);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.uniform1i(this.getUniform("u_mode"), 1);

        for (let [id, elm] of this.elms) {
            if (elm.getOpacity() < 0.01) {
                continue;
            }

            gl.activeTexture(gl.TEXTURE0);
            elm.bindTex();
            gl.uniformMatrix3fv(this.getUniform("u_el_transform"), false, elm.getElTransform());
            gl.uniformMatrix3fv(this.getUniform("u_tex_transform"), false, elm.getTexTransform());
            gl.uniform1f(this.getUniform("u_opacity"), elm.getOpacity());

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        // render




        this.rendertime.push(performance.now() - renderstart);
        while (this.rendertime.length > 10) {
            this.rendertime.shift();
        }
        const avgRender = this.rendertime.reduce((prev, curr) => prev + curr) / this.rendertime.length;
        this.fps++;
        this.runRender();
    }

}
