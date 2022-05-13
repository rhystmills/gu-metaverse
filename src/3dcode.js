// Work-around to render a Cabinet Oblique Projection
// Use an orthographic camera, and apply a shear matrix to the geometry before rendering

// dom
let container = document.createElement( 'div' );
document.body.appendChild( container );

// renderer
let renderer = new THREE.WebGLRenderer( );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

// scene
let scene = new THREE.Scene();

// camera
let d = window.innerWidth / window.innerHeight;
let camera = new THREE.OrthographicCamera( -10 * d, 10 * d, 10, -10, 1, 1000 );
camera.position.set( 0, 0, 20 ); // looking down the z-axis
camera.lookAt( scene.position );

// material
let material = new THREE.MeshNormalMaterial( { overdraw: 0.5 } );

// geometry
let geometry = new THREE.BoxGeometry( 1, 3, 1 );
geometry.rotateY(Math.PI / 16);

let mesh = new THREE.Mesh( geometry, material ); // centered at the origin

scene.add( mesh );
let alpha = Math.PI / 6; // or Math.PI / 4

let Syx = 0,
    Szx = 0,
    Sxy = 0,
    Szy = - 1 * Math.sin( alpha ),
    Sxz = 0,
    Syz = 0;

let matrix = new THREE.Matrix4();

matrix.set(   1,   Syx,  Szx,  0,
    Sxy,     1,  Szy,  0,
    Sxz,   Syz,   1,   0,
    0,     0,   0,   1  );

// apply shear matrix to geometry
mesh.geometry.applyMatrix( matrix ); // this is the work-around hack <======================

// render
renderer.render( scene, camera );
