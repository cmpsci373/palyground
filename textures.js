/* CMPSCI 373 Homework 5: Hierarchical Scene */

const width = 800, height = 600;
const fov = 60;
const cameraz = 2;
const aspect = width/height;
const smoothShading = true;
let   animation_speed = 1.0;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
camera.position.set(0, 1, cameraz);

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setClearColor(0x101010);
window.onload = function(e) {
	document.getElementById('window').appendChild(renderer.domElement);
}
let orbit = new THREE.OrbitControls(camera, renderer.domElement);	// create mouse control

let light0 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light0.position.set(camera.position.x, camera.position.y, camera.position.z);	// this light is at the camera
scene.add(light0);

let light1 = new THREE.DirectionalLight(0x808080, 1.0); // red light
light1.position.set(-1, 1, 0);
scene.add(light1);

let light2 = new THREE.DirectionalLight(0x808080, 1.0); // blue light
light2.position.set(1, 1, 0);
scene.add(light2);

let amblight = new THREE.AmbientLight(0x202020);	// ambient light
scene.add(amblight);

// ===========================================
// load texture image
let loader = new THREE.TextureLoader();
let texture = loader.load('checker.jpg');
let checker = loader.load('checker.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
//texture.repeat.set(4,4);
checker.wrapS = THREE.RepeatWrapping;
checker.wrapT = THREE.RepeatWrapping;
//checker.repeat.set(2,2);

// create material
let material = new THREE.MeshBasicMaterial({map: texture});
//material = new THREE.MeshPhongMaterial({color:0xffffff, map:texture, specular:0x101010, shininess: 50, side:THREE.FrontSide});
//material = new THREE.MeshPhongMaterial({color:0xffffff, map:texture, specular:0x808080, specularMap:checker, shininess: 50, side:THREE.FrontSide});

// create object
let object = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), material);
//object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
//object = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
scene.add(object);

// ===========================================

/*
let uvs = object.geometry.faceVertexUvs[0];
for(let i=0;i<uvs.length;i++) {
	uvs[i][0].multiplyScalar(0.5);
	uvs[i][1].multiplyScalar(0.5);
	uvs[i][2].multiplyScalar(0.5);		
}*/

let models = []; // array that stores all models
let numModelsLoaded = 0;
let numModelsExpected = 0;

// load OBJ models or create shapes
// ===YOUR CODE STARTS HERE===

// ---YOUR CODE ENDS HERE---
loadOBJ('objs/bird.obj', material, 'bird');

// 'label' is a unique name for the model for accessing it later
function loadOBJ(fileName, material, label) {
	numModelsExpected++;
	loadOBJAsMesh(fileName, function(mesh) { // callback function for non-blocking load
		mesh.computeFaceNormals();
		if(smoothShading) mesh.computeVertexNormals();
		models[label] = new THREE.Mesh(mesh, material);
		numModelsLoaded++;
	}, function() {}, function() {});
}

let initialized = false;
function animate() {
	requestAnimationFrame( animate );
	if(numModelsLoaded == numModelsExpected) {	// all models have been loaded
		if(!initialized) {
			initialized = true;

			let geometry = models['bird'].geometry;
			let vertices = geometry.vertices;
			let faces = geometry.faces;
			let uvs = geometry.faceVertexUvs[0] = [];
			for(let i=0;i<faces.length;i++) {
				let v0 = vertices[faces[i].a];
				let v1 = vertices[faces[i].b];
				let v2 = vertices[faces[i].c];
				uvs.push([xyzToUv(v0), xyzToUv(v1), xyzToUv(v2)]);
			}
			geometry.uvsNeedUpdate = true;
			//scene.add(models['bird']);
			
		}
	}
	light0.position.set(camera.position.x, camera.position.y, camera.position.z); // light0 always follows camera position
	renderer.render(scene, camera);
}

function xyzToUv(v) {
	let vv = v.clone();
	vv.normalize();
	return new THREE.Vector2(Math.atan2(vv.y, vv.x)/Math.PI, Math.acos(vv.z)/Math.PI);
}

animate();

function onKeyDown(event) {
	switch(event.key) {
		case 'w':
		case 'W':
			material.wireframe = !material.wireframe;
			break;
		case '=':
		case '+':
			animation_speed += 0.05;
			document.getElementById('msg').innerHTML = 'animation_speed = '+animation_speed.toFixed(2);
			break;
		case '-':
		case '_':
			if(animation_speed>0) animation_speed-=0.05;
			document.getElementById('msg').innerHTML = 'animation_speed = '+animation_speed.toFixed(2);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
	}
}

window.addEventListener('keydown', onKeyDown, false); // as key control if you need
