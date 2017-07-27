
var alignTriangles = function( exports ){

    var object, center, normal, transform, rotation, inverse;
    function init(){
        object = new THREE.Object3D();
        center = new THREE.Vector3();
        normal = new THREE.Vector3();
        transform = new THREE.Matrix4();
        rotation = new THREE.Matrix4();
        inverse = new THREE.Matrix4();
    }
    /**
     * find the transform matrix that aligns 3 source Vector3 to 3 destination Vector3
     * @param src array of 3 source Vector3
     * @param dst array of 3 destination Vector3
     * @returns the return matrix {THREE.Matrix4}
     */
    function getTransform( src, dst, faceNormal ){

        //init vars if need be
        if( object === undefined )init();

        //1
        // computes the face center and copies the normal
        center.set( 0,0,0 ).add(dst[0]).add(dst[1]).add(dst[2]).multiplyScalar(1/3);
        normal.copy( faceNormal );

        //2
        // positions the generic object at the center
        object.position.copy( center );
        //and make it point in the direction of the face
        object.lookAt( center.add( normal.multiplyScalar( 100 ) ) );
        object.updateMatrixWorld();

        //store this transform
        transform.copy( object.matrixWorld );

        //3
        // use the inverse of the object's matrix to transform the triangle's vertices
        inverse = inverse.getInverse(transform);
        var flat = [];
        dst.forEach(function( p ) {
            var v = p.clone().applyMatrix4(inverse);
            v.z = 0;
            flat.push(v);
        });
        //4
        // multiply the object's transform matrix with the 2D affine transform
        return transform.multiply( getTransformMatrix( rotation, src, flat ) );

    }
    function adjugate(m) {
        return [
            m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
            m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
            m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
        ];
    }
    function multiplyMatrices(a, b) {
        var c = new Float32Array(9);
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                var cij = 0;
                for (var k = 0; k < 3; ++k) {
                    cij += a[3 * i + k] * b[3 * k + j];
                }
                c[3 * i + j] = cij;
            }
        }
        return c;
    }
    function getTransformMatrix( mat, source, dest ){
        mat.identity();
        var src = [ source[0].x, source[0].y, source[1].x, source[1].y, source[2].x, source[2].y];
        var dst = [ dest[0].x, dest[0].y, dest[1].x, dest[1].y, dest[2].x, dest[2].y];
        var t = multiplyMatrices(
            [dst[0], dst[2], dst[4], dst[1], dst[3], dst[5], 1, 1, 1],
            adjugate([src[0], src[2], src[4], src[1], src[3], src[5], 1, 1, 1])
        );
        mat.elements = [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]];
        return mat;
    }

    exports.getTransform = getTransform;
    return exports;

}({});