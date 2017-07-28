
var scene, camera, renderer, resolution, controls, material, startTime;
function init3D(){

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor( new THREE.Color( 0x101010 ));
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    window.addEventListener( 'resize', onResize );
    onResize();

}

function onResize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
}

function load( res ){

    if( assetsLoader.mesh === undefined ){

        assetsLoader.load([

            { name:"mesh",          url:"models/predator"+res+".js", type:assetsLoader.MOD },

            { name:"env_vert",      url:"glsl/envmap_vs.glsl", type:assetsLoader.TXT },
            { name:"env_frag",      url:"glsl/envmap_fs.glsl", type:assetsLoader.TXT },

            { name:"vertexShader",          url:"glsl/fluffy_vs.glsl", type:assetsLoader.TXT },
            { name:"fragmentShader",          url:"glsl/fluffy_fs.glsl", type:assetsLoader.TXT },

            { name:"texture",       url:"textures/env.png", type:assetsLoader.IMG },
            { name:"texture2",      url:"textures/env2.jpg", type:assetsLoader.IMG }

        ], onLoad );

        var btn = document.getElementById('select');
        document.body.removeChild(btn);

    }

}


function onLoad() {

    init3D();

    var object = assetsLoader.mesh;
    object.computeVertexNormals();
    var envmap = new THREE.ShaderMaterial( {
        uniforms: {
            env: {type:"t", value:assetsLoader.texture }
        },
        vertexShader:assetsLoader.env_vert,
        fragmentShader:assetsLoader.env_frag,
        transparent: true
    } );

    var m = new THREE.Mesh( object, envmap );
    scene.add(m);

    var mesh = toInstanced(object);

    //this prevent the mesh from disappearing when too close
    mesh.frustumCulled = false;
    scene.add( mesh );


    camera.position.copy( {x: -100.32919722157854, y: 94.22507699183404, z: 146.0295339101336} );
    controls.target.copy( {x: 49.25195956775783, y: 72.26443254478691, z: 42.352961091873546} );
    controls.update();
    startTime = Date.now();
    update();

}

function toInstanced( distribution, count ){


    // source triangle as vectors (to compute matrices)
    var vectors = [];

    //adds a basis triangle to compoute the affine transform
    for ( var i = 0; i< 3;i++){
        var a = Math.PI / 180 * 120 * i;
        var v = new THREE.Vector3(Math.cos( a ), Math.sin( a ), 0);
        vectors.push( v );
    }

    //source geometry buffers (a pyramid made of 3 triangles)
    var height = 10;
    var originBuffer = [];
    var targetBuffer = [];
    for ( i = 0; i < 3;i++){
        a = Math.PI / 180 * 120 * i;
        var na = a + Math.PI / 180 * 120;
        originBuffer.push( 0,0, 0.0, Math.cos( a ), Math.sin( a ), 0, Math.cos( na ), Math.sin( na ), 0 );
        targetBuffer.push( 0,0, height, Math.cos( a ), Math.sin( a ), 0, Math.cos( na ), Math.sin( na ), 0 );
    }

    var geometry = new THREE.InstancedBufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(originBuffer), 3) );
    geometry.addAttribute( 'target', new THREE.BufferAttribute(  new Float32Array(targetBuffer), 3) );

    //InstancedBufferAttribute initialisation
    var faces = distribution.faces;
    var vertices = distribution.vertices;
    var instances = faces.length;

    // transforms
    var transformsCol0 = new Float32Array(instances * 4);
    var transformsCol1 = new Float32Array(instances * 4);
    var transformsCol2 = new Float32Array(instances * 4);
    var transformsCol3 = new Float32Array(instances * 4);

    var transformIterator = 0;
    var col0 = 0;
    var col1 = 0;
    var col2 = 0;
    var col3 = 0;

    //normals
    var normalIterator = 0;
    var normalBuffer = new Float32Array(instances * 3);

    for( i = 0; i < faces.length; i++ ){

        var f = faces[i];

        //compute the triangle to triangle matrix
        var t = alignTriangles.getTransform( vectors, [vertices[f.a],vertices[f.b],vertices[f.c]], f.normal );

        //collect the matrix elements and stores them in 4 * vec4
        transformIterator = 0;

        transformsCol0[col0++] = t.elements[transformIterator++];
        transformsCol0[col0++] = t.elements[transformIterator++];
        transformsCol0[col0++] = t.elements[transformIterator++];
        transformsCol0[col0++] = t.elements[transformIterator++];

        transformsCol1[col1++] = t.elements[transformIterator++];
        transformsCol1[col1++] = t.elements[transformIterator++];
        transformsCol1[col1++] = t.elements[transformIterator++];
        transformsCol1[col1++] = t.elements[transformIterator++];

        transformsCol2[col2++] = t.elements[transformIterator++];
        transformsCol2[col2++] = t.elements[transformIterator++];
        transformsCol2[col2++] = t.elements[transformIterator++];
        transformsCol2[col2++] = t.elements[transformIterator++];

        transformsCol3[col3++] = t.elements[transformIterator++];
        transformsCol3[col3++] = t.elements[transformIterator++];
        transformsCol3[col3++] = t.elements[transformIterator++];
        transformsCol3[col3++] = t.elements[transformIterator++];

        //normals
        normalBuffer[normalIterator++] = f.normal.x;
        normalBuffer[normalIterator++] = f.normal.y;
        normalBuffer[normalIterator++] = f.normal.z;

    }

    //assign InstancedBufferAttributes to geometry
    geometry.addAttribute('transformsCol0', new THREE.InstancedBufferAttribute(transformsCol0, 4, 1 ));
    geometry.addAttribute('transformsCol1', new THREE.InstancedBufferAttribute(transformsCol1, 4, 1 ));
    geometry.addAttribute('transformsCol2', new THREE.InstancedBufferAttribute(transformsCol2, 4, 1 ));
    geometry.addAttribute('transformsCol3', new THREE.InstancedBufferAttribute(transformsCol3, 4, 1 ));
    geometry.addAttribute('normal', new THREE.InstancedBufferAttribute(normalBuffer, 3, 1 ));

    // material
    material = new THREE.RawShaderMaterial( {
        uniforms: {
            time: { type:"f", value:0},
            env0: {type:"t", value:assetsLoader.texture },
            env1: {type:"t", value:assetsLoader.texture2 }
        },
        vertexShader:           assetsLoader.vertexShader,
        fragmentShader:         assetsLoader.fragmentShader,
        transparent: true
    } );

    return new THREE.Mesh( geometry, material );

}

function update() {

    requestAnimationFrame(update);
    if (material){
        material.uniforms.time.value = ( startTime - Date.now() ) * 0.001;
    }
    renderer.render( scene, camera );

}