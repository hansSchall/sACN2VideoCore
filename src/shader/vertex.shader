attribute vec2 a_objectPos;

varying vec2 v_texturePos;

uniform lowp int u_mode;
uniform lowp float u_zind;
uniform lowp int u_flip;

uniform mat3 u_el_transform;

uniform mat3 u_tex_transform;

#define FLIP false

// 0 to 1 > -1 to 1
vec2 tex2clip(vec2 pos) {
    return FLIP ? (pos * -2. + 1.) : (pos * 2. - 1.);
}
// -1 to 1 > 0 to 1
vec2 clip2tex(vec2 pos) {
    return FLIP ? ((pos - 1.) / -2.) : ((pos + 1.) / 2.);
}

void main() {
    gl_Position = vec4((u_el_transform * vec3(tex2clip(a_objectPos), 1)).xy, u_zind, 1);
    v_texturePos = clip2tex((u_tex_transform * vec3(tex2clip(a_objectPos), 1.)).xy);
}
