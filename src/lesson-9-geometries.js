import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const canvas = document.querySelector(".webgl");

// cusor
const cursor = {
    x: 0,
    y: 0,
};

window.addEventListener("mousemove", (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = -(e.clientY / sizes.height - 0.5);
});

const scene = new THREE.Scene();

// const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
// const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// Custom geometry
/*
const positionsArray = new Float32Array(9);
// first vertex at (0, 0, 0) -> (x, y, z)
positionsArray[0] = 0;
positionsArray[1] = 0;
positionsArray[2] = 0;

// second vertext at (0, 1, 0)
positionsArray[3] = 0;
positionsArray[4] = 1;
positionsArray[5] = 0;

// third vertext at (1, 0, 0)
positionsArray[6] = 1;
positionsArray[7] = 0;
positionsArray[8] = 0;
*/

const geometry = new THREE.BufferGeometry();

const triangleCount = 50;
// 50 triangles with 3 vertices each that each have 3 values
const positionsArray = new Float32Array(triangleCount * 3 * 3);
for (let i = 0; i < positionsArray.length; i++) {
    positionsArray[i] = Math.random() - 0.5;
}
// 3 indicates 3 attributes per 1 vertex
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
geometry.setAttribute("position", positionsAttribute);

// some geometries have triangles that can share the same vertex

const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// y axis goes upward, x axis goes to the right, z axis goes towards us
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
window.addEventListener("resize", () => {
    // update sizes object to new width / height
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // update the camera aspect as well
    camera.aspect = sizes.width / sizes.height;

    // tell 3js to update projection matrix
    camera.updateProjectionMatrix();

    // update renderer
    renderer.setSize(sizes.width, sizes.height);
    // update pixel ratio, for cases where users drag our app to another monitor
    // with different pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// go fullscreen when user double clicks our app
window.addEventListener("dblclick", () => {
    // does not work on safari ofc
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// first parameter is the vertical FoV (45 - 75 usually good)
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);

camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Axes helper (visualizes axes)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
    canvas,
});
// limit pixel ratio to max of 2 (usually > 2 on mobile)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
const tick = () => {
    controls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
