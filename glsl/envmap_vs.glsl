precision highp float;

varying vec3 e;
varying vec3 n;
void main() {

    vec4 projection = modelViewMatrix * vec4( position, 1.0 );
    e = normalize( projection.xyz );
    n = normalize( normalMatrix * normal );
    gl_Position = projectionMatrix * projection;

}