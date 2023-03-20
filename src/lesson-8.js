import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// cusor
const cursor = {
    x: 0,
    y: 0,
};
window.addEventListener("mousemove", (e) => {
    // values go between 0 and 1 (when cursor is inside the canvas)
    // but we want the value to go from negative to positive (-0.5 to 0.5),
    // so subtract 0.5
    cursor.x = e.clientX / sizes.width - 0.5;
    // invert since positive goes upward in Threejs
    cursor.y = -(e.clientY / sizes.height - 0.5);
});

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

// first parameter is the vertical FoV (45 - 75 usually good)
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);

/*
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
    -1 * aspectRatio,
    1 * aspectRatio,
    1,
    -1,
    0.1,
    100
);
*/

// camera.position.x = 2;
// camera.position.y = 2;
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

const controls = new OrbitControls(camera, document.querySelector(".webgl"));
controls.enableDamping = true;

// requestAnimationFrame's purpose is to call a function on the browser's next render frame

// Axes helper (visualizes axes)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
});

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    /*
    // does a full rotation when moving cursor from left to right
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // Z not Y
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;

    camera.position.y = cursor.y * 5;
    */
    // Threejs has builtin Controls classes (not part of Three, its in the
    // examples folder)
    // camera.lookAt(mesh.position);

    // update controls (need to update controls() on each frame if damping)
    controls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
