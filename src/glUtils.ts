export function undefinedMsg<T>(fnVal: T | undefined | null, msg: string): T {
    if (!fnVal) {
        throw new Error(msg);
    } else {
        return fnVal;
    }
}

export function webGlundefined() {
    return new Error("[unexpected] WebGLContext is undefined");
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error("WebGL Shader creation failed");
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    } else {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("WebGL Shader creation failed");
    }
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram();
    if (!program) {
        throw new Error("WebGL Program creation failed");
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

export function compileShader(gl: WebGL2RenderingContext, vertexCode: string, fragmentCode: string) {
    const pr = createProgram(gl,
        createShader(gl, gl.VERTEX_SHADER, vertexCode),
        createShader(gl, gl.FRAGMENT_SHADER, fragmentCode));
    if (pr) {
        return pr;
    } else {
        throw new Error("WebGL Program creation failed");
    }
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;
    if (needResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return needResize;
}

export function vec2(x: number, y: number): vec2 {
    return [x, y];
}
export type vec2 = [number, number];
export type TransformProps = [vec2, vec2, vec2, vec2];
export const transformProps: TransformProps = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)
]

export function int(val: string | number) {
    if (typeof val == "number") {
        return val;
    } else {
        return parseInt(val);
    }
}

export type Pos = {
    x: number,
    y: number,
    h: number,
    w: number
}

export function Pos2Buffer({ x, y, h, w }: Pos) {
    return new Float32Array([x, y, x + w, y, x + w, y + h, x, y, x, y + h, x + w, y + h]);
}

export function mergeTransformMatrices([aa, ab]: [(number[] | null), (number[] | null)], [ba, bb]: [(number[] | null), (number[] | null)]): [number[], number[]] {
    return [mergeTransformMatrix(aa, ba), mergeTransformMatrix(ab, bb)];
}

export function mergeTransformMatrix(a: number[] | null, b: number[] | null): number[] {
    if (a) {
        if (b) {
            return m3.multiply2(a, b);
        } else {
            return a;
        }
    } else {
        if (b) {
            return b;
        } else {
            return m3.empty();
        }
    }
}

// from https://webglfundamentals.org/
// (adapted)
// License:
// # Copyright 2021 GFXFundamentals.
// # All rights reserved.
// #
// # Redistribution and use in source and binary forms, with or without
// # modification, are permitted provided that the following conditions are
// # met:
// #
// # * Redistributions of source code must retain the above copyright
// # notice, this list of conditions and the following disclaimer.
// # * Redistributions in binary form must reproduce the above
// # copyright notice, this list of conditions and the following disclaimer
// # in the documentation and / or other materials provided with the
// # distribution.
// # * Neither the name of GFXFundamentals.nor the names of his
// # contributors may be used to endorse or promote products derived from
// # this software without specific prior written permission.
// #
// # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// # "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// # LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// # A PARTICULAR PURPOSE ARE DISCLAIMED.IN NO EVENT SHALL THE COPYRIGHT
// # OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// # SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES(INCLUDING, BUT NOT
// # LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// # DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// # THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// #(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// # OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export const m3 = {
    multiply(...mats_: (number[] | null)[]): number[] {
        const mats: number[][] = mats_.filter(_ => _ !== null) as any;
        if (mats.length === 0) {
            return m3.empty();
        } else if (mats.length === 1) {
            return mats[0];
        } else if (mats.length === 2) {
            const [a, b] = mats;
            return m3.multiply2(a, b);
        } else {
            const [a, b, ...more] = mats;
            return m3.multiply(m3.multiply2(a, b), ...more);
        }
    },
    multiply2(a: number[], b: number[]) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];
        const b00 = b[0 * 3 + 0];
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];

        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    translation(tx: number, ty: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation(angle: number, unit: "rad" | "deg" = "deg") {
        const angleInRadians = unit == "deg" ? angle / 360 * Math.PI * 2 : angle;
        var c = Math.cos(-angleInRadians);
        var s = Math.sin(-angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    scaling(sx: number, sy: number) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },

    empty() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]
    }

};
