// https://www.math.hmc.edu/~dyong/math164/2006/win/finalreport.pdf

#version 100

precision highp float;

const int MAGNET_COUNT = 4;
struct Magnet {
    vec2 position;
    float strength;
    float hoverHeight;
    vec4 color;
};

varying vec2 uv;

uniform float gravityStrength;
uniform float friction;

uniform float time;

const float DT = 0.1;

/// Get force on the particle, using (0, 0) as the origin.
vec2 particleForce(vec2 pos, Magnet magnets[MAGNET_COUNT]) {
    vec2 force = -pos * gravityStrength;

    for(int c = 0; c < MAGNET_COUNT; c++) {
        Magnet magnet = magnets[c];
        force += (pos - magnet.position) / pow((magnet.position.x - pos.x) * (magnet.position.x - pos.x) + (magnet.position.y - pos.y) * (magnet.position.y - pos.y) + magnet.hoverHeight * magnet.hoverHeight, 1.5) * magnet.strength;
    }

    return force;
}

void main() {
    Magnet magnets[MAGNET_COUNT];
    magnets[0] = Magnet(vec2(0.0), 1.2, 0.05, vec4(0.47, 1, 0.52, 1));
    magnets[1] = Magnet(vec2(0.0), 1.2, 0.05, vec4(0.91, 0.77, 0.95, 1));
    magnets[2] = Magnet(vec2(0.0), 1.2, 0.05, vec4(0.2, 0, 0.35, 1));
    magnets[3] = Magnet(vec2(sin(time * 0.3), cos(time * 0.7)) * sin(time * 0.22), 0.5, 0.1, vec4(0.32, 0.92, 1, 1));

    for(int c = 0; c < MAGNET_COUNT - 1; c++) {
        float theta = 6.28 / 3.0 * float(c);
        magnets[c].position = vec2(cos(theta), sin(theta)) * 0.5;
    }

    vec2 pos = uv - 0.5;
    vec2 vel = vec2(cos(time), sin(time * 1.1)) * sin(time * 0.88);

    // for(int c = 0; c < MAGNET_COUNT; c++) {
    //     Magnet magnet = magnets[c];
    //     if(distance(magnet.position, pos) < 0.02) {
    //         gl_FragColor = magnet.color * vec4(vec3(0.5), 1.0);
    //         return;
    //     }
    // }

    for(int c = 0; c < 100; c++) {
        vel += particleForce(pos, magnets) * DT;
        vel -= vel * friction * DT;
        pos += vel * DT;
    }

    float minDist = 9999999.9;
    for(int c = 0; c < MAGNET_COUNT; c++) {
        Magnet magnet = magnets[c];
        float dist = distance(pos, magnet.position);
        if(dist < minDist) {
            minDist = dist;
            gl_FragColor = magnet.color;
        }
    }
}