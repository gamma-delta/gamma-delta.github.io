// https://www.math.hmc.edu/~dyong/math164/2006/win/finalreport.pdf

#version 100

precision highp float;

varying vec2 uv;
varying vec4 color;

uniform vec2 magnet1;
uniform vec2 magnet2;
uniform vec2 magnet3;

uniform float gravityStrength;
uniform float magnetDistance;
uniform float magnetStrength;
uniform float friction;

uniform float time;

const float DT = 0.1;

/// Get force on the particle, using (0, 0) as the origin.
vec2 particleForce(vec2 pos) {
    vec2 gravityForce = -pos * gravityStrength;

    vec2 m1Force = (pos - magnet1) / pow((magnet1.x - pos.x) * (magnet1.x - pos.x) + (magnet1.y - pos.y) * (magnet1.y - pos.y) + magnetDistance * magnetDistance, 1.5) * magnetStrength;
    vec2 m2Force = (pos - magnet2) / pow((magnet2.x - pos.x) * (magnet2.x - pos.x) + (magnet2.y - pos.y) * (magnet2.y - pos.y) + magnetDistance * magnetDistance, 1.5) * magnetStrength;
    vec2 m3Force = (pos - magnet3) / pow((magnet3.x - pos.x) * (magnet3.x - pos.x) + (magnet3.y - pos.y) * (magnet3.y - pos.y) + magnetDistance * magnetDistance, 1.5) * magnetStrength;

    return gravityForce + m1Force + m2Force + m3Force;
}

void main() {
    vec2 pos = uv - 0.5;
    vec2 vel = vec2(cos(time), sin(time * 1.1)) * sin(time * 0.88);

    for(int c = 0; c < 100; c++) {
        vel += particleForce(pos) * DT;
        vel -= vel * friction * DT;
        pos += vel * DT;
    }

    float m1dist = distance(pos, magnet1);
    float m2dist = distance(pos, magnet2);
    float m3dist = distance(pos, magnet3);
    if(m1dist < m2dist && m1dist < m3dist) {
        gl_FragColor = vec4(0.47, 1, 0.52, 1);
    } else if(m2dist < m1dist && m2dist < m3dist) {
        gl_FragColor = vec4(0.91, 0.77, 0.95, 1);
    } else if(m3dist < m1dist && m3dist < m2dist) {
        gl_FragColor = vec4(0.2, 0, 0.35, 1);
    } else {
        gl_FragColor = vec4(0.93, 1, 0, 1);
    }

}