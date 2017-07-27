precision highp float;

uniform sampler2D env0;
uniform sampler2D env1;

varying float vNoise;
varying vec3 e;
varying vec3 n;
void main() {

    if( vNoise <= 0. ) discard;

    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    gl_FragColor = vec4( ( mix( texture2D( env0, vN ), texture2D( env1, vN ), vNoise ) ).rgb, vNoise );
}

