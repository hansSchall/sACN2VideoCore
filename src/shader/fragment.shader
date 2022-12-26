precision lowp float;
precision lowp int;

varying vec2 v_texturePos;

uniform sampler2D t_texture;
uniform sampler2D t_mask;
uniform sampler2D t_fbTex;

uniform lowp int u_mode;
uniform float u_opacity;

uniform vec2 u_eTL;
uniform vec2 u_eTR;
uniform vec2 u_eBL;
uniform vec2 u_eBR;

#define u_maskMode 1

// following two functions taken from https://iquilezles.org/articles/ibilinear/

float cross2d(in vec2 a, in vec2 b) { return a.x * b.y - a.y * b.x; }

vec2 inverseBilinear(in vec2 p, in vec2 a, in vec2 b, in vec2 c, in vec2 d)
{
    vec2 res = vec2(-1.0);

    vec2 e = b - a;
    vec2 f = d - a;
    vec2 g = a - b + c - d;
    vec2 h = p - a;

    float k2 = cross2d(g, f);
    float k1 = cross2d(e, f) + cross2d(h, g);
    float k0 = cross2d(h, e);

    // if edges are parallel, this is a linear equation
    if (abs(k2) < 0.001)
    {
        res = vec2((h.x * k1 + f.x * k0) / (e.x * k1 - g.x * k0), -k0 / k1);
    }
    // otherwise, it's a quadratic
    else
    {
        float w = k1 * k1 - 4.0 * k0 * k2;
        if (w < 0.0) return vec2(-1.0);
        w = sqrt(w);

        float ik2 = 0.5 / k2;
        float v = (-k1 - w) * ik2;
        float u = (h.x - f.x * v) / (e.x + g.x * v);

        if (u < 0.0 || u>1.0 || v < 0.0 || v>1.0)
        {
            v = (-k1 + w) * ik2;
            u = (h.x - f.x * v) / (e.x + g.x * v);
        }
        res = vec2(u, v);
    }

    return res;
}

vec2 bilinear(in vec2 p, in vec2 a, in vec2 b, in vec2 c, in vec2 d) {
    vec2 _p = a + (b - a) * p.x;
    vec2 _q = d + (c - d) * p.x;
    return _p + (_q - _p) * p.y;
    // return b + (b - a) * p.x + (d - a) * p.y + ((a - b) + (c - d)) * p.x * p.y;
}

bool outOf01Range(vec2 pos) {
    if (pos.x < 0. || pos.x > 1. || pos.y < 0. || pos.y > 1.) {
        return true;
    } else {
        return false;
    }
}

void main() {
    if (u_mode == 1) { // 1:1 copy t_texture
        gl_FragColor = texture2D(t_texture, v_texturePos);
        gl_FragColor.a *= u_opacity;
        if (outOf01Range(v_texturePos)) {
            gl_FragColor = vec4(0, 0, 0, 0); //transparent
        }
    } else if (u_mode == 2) { // inverse bilinear
        vec2 flipedTexPos = v_texturePos * vec2(1, -1) + vec2(0, 1);
        vec2 texPix = inverseBilinear(flipedTexPos, u_eTL, u_eTR, u_eBR, u_eBL);
        if (outOf01Range(texPix)) {
            gl_FragColor = vec4(0, 0, 0, 0); //transparent
        } else {
            vec4 maskColor = texture2D(t_mask, flipedTexPos);
            gl_FragColor = texture2D(t_fbTex, texPix);
            float alpha = 1.;
            //maskMode == 0 //disable mask
            if (u_maskMode == 1) { //red
                alpha = maskColor.r;
            } else if (u_maskMode == 2) { //green
                alpha = maskColor.g;
            } else if (u_maskMode == 3) { //blue
                alpha = maskColor.b;
            } else if (u_maskMode == 4) { //alpha
                alpha = maskColor.a;
            }
            gl_FragColor.a = alpha > .5 ? 1. : 0.;
        }
    } else if (u_mode == 3) {
        vec2 flipedTexPos = v_texturePos * vec2(1, -1) + vec2(0, 1);
        vec2 texPix = bilinear(flipedTexPos, u_eTL, u_eTR, u_eBR, u_eBL);
        if (outOf01Range(texPix)) {
            gl_FragColor = vec4(0, 0, 0, 0); //transparent
        } else {
            vec4 maskColor = texture2D(t_mask, texPix);
            gl_FragColor = texture2D(t_fbTex, flipedTexPos);
            float maskValue = 1.;
            if (u_maskMode == 1) { //red
                maskValue = maskColor.r;
            } else if (u_maskMode == 2) { //green
                maskValue = maskColor.g;
            } else if (u_maskMode == 3) { //blue
                maskValue = maskColor.b;
            } else if (u_maskMode == 4) { //alpha
                maskValue = maskColor.a;
            }
            gl_FragColor *= maskValue > .5 ? 1. : u_opacity;
            gl_FragColor.a = 1.;
        }
    } else if (u_mode == 4) {// 1:1 copy framebuffer
        gl_FragColor = texture2D(t_fbTex, v_texturePos * vec2(1, -1) + vec2(0, 1));
    }
}
