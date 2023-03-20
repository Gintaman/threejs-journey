import * as THREE from "three";

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "red" });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// y axis goes upward, x axis goes to the right, z axis goes towards us
const sizes = {
    width: 800,
    height: 600,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// distance from the cube to the camera
// console.log(mesh.position.distanceTo(camera.position));

// normalize takes the position vector and reduces it to 1
// mesh.position.normalize();
// console.log(mesh.position.length());

// set x, y and z (red is positive X axis, green is positive Y axis,
// blue is positive Z axis
mesh.position.set(0.7, -0.6, 1);

// scale is also a vec3 (default is 1, 1, 1)
mesh.scale.set(2, 0.5, 0.5);

// rotate with 'rotation' or 'quaternion' (updating one updates the other)
// rotation also has x, y and z properties but its not a vector its an Euler
// to rotate it 360 degrees along the Y axis, set mesh.rotation.y = PI
// (the imagine putting a pencil on a table and spinning it 360 degrees. the
// table's surface is the Y axis)
// when rotating, the order of axes rotation is important
// we can change rotation order using reorder() method
mesh.rotation.reorder("YXZ"); // first rotates Y, then X, then Z
mesh.rotation.x = Math.PI / 4;
mesh.rotation.y = Math.PI / 4;
// quaternions is a more mathematical expression of a rotation

// Object3D instances have a lookAt() method,w hich rotates the object so its
// -Z faces the target you provide (a vector3)
// camera.lookAt(mesh.position);

// create a group of meshes and transform the together
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "cyan" })
);
group.add(cube1);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "blue" })
);
cube2.position.x = -2;
group.add(cube2);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "green" })
);
cube3.position.x = 2;
group.add(cube3);

group.rotation.y = 1;

// Axes helper (visualizes axes)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
