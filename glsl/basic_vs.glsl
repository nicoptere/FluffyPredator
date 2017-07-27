
precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

//'blueprint'
attribute vec3 position;

//instances
attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;

// transforms the 'blueprint' geometry with instance attributes
vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
    //applies the scale
    position *= S;
    //computes the rotation where R is a (vec4) quaternion
    position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
    //translates the transformed 'blueprint'
    position += T;
    //return the transformed position
    return position;
}
//re-use position for shading
varying vec3 vPos;
void main() {

    //collects the 'blueprint' coordinates
    vec3 pos = position;
    //transform it
    transform( pos, translation, rotation, scale );
    //project to get the fragment position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    //just to render something :)
    vPos = pos;

}
