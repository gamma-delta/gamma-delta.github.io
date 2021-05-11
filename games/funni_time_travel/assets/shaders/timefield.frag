#version 100

precision highp float;
varying vec2 uv;
varying vec4 color;
uniform sampler2D Texture;

// stuff passed in
uniform vec2 worldpos;
uniform float time;
uniform ivec4 connections;
uniform ivec4 diagonal_connections;

const vec2 texture_ratio = vec2(1. / 4., 1. / 3.);

void main() {
    vec2 moved_uv = (uv + worldpos) * texture_ratio + (time + sin(time)) * vec2(0.05, -0.03);
    moved_uv = mod(moved_uv, vec2(1.0));

    vec4 straight_closeness = vec4(connections) * vec4(1.0 - uv.y, uv.x, uv.y, 1.0 - uv.x);
    vec4 diag_closeness = vec4(diagonal_connections) * vec4(uv.x + 1.0 - uv.y, uv.x + uv.y, 1.0 - uv.x + uv.y, 1.0 - uv.x + 1.0 - uv.y);
    float neighbor_weighting = log(0.5 + dot(straight_closeness, vec4(1.0)) + dot(diag_closeness, vec4(0.1))) * 0.3;

    vec2 opacity_pos = uv + worldpos + vec2(time * -0.9, time * 1.2);
    float opacity = (sin(opacity_pos.x + opacity_pos.y) + cos(opacity_pos.y * 2.0 - opacity_pos.x)) * 0.1 + 0.3;
    opacity = clamp(opacity + neighbor_weighting, 0.1, 1.0);

    vec4 tex_color = texture2D(Texture, moved_uv) * color;
    gl_FragColor = tex_color * vec4(1.0, 1.0, 1.0, opacity);
    // gl_FragColor = vec4(moved_uv, 0.0, 1.0);
}