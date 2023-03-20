import * as THREE from "three";
import gsap from "gsap";

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

// requestAnimationFrame's purpose is to call a function on the browser's next render frame

// Axes helper (visualizes axes)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
});

renderer.setSize(sizes.width, sizes.height);

// animations
// method 1 using time delta
/*
let time = Date.now();

// requestAnimationFrame called once per frame, so its called more on higher FPS monitors.
// we want to animate at the same rate, so we use a time delta
const tick = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - time;
    time = currentTime;

    // update objects
    mesh.rotation.x += 0.001 * deltaTime;
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
*/

// method 2 usingThree.Clock
/*
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    console.log(elapsedTime);

    // rotate 1 full revolution per second
    // mesh.rotation.y = elapsedTime * Math.PI * 2;

    // oscillates up and down
    // mesh.position.y = Math.sin(elapsedTime);

    // oscillates left and right
    // mesh.position.x = Math.cos(elapsedTime);

    camera.position.y = Math.sin(elapsedTime);
    camera.position.x = Math.cos(elapsedTime);
    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
*/

// method 3 using gsap library (more fine tuned)
// first parameter object to animate, second is the destination
gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 });
gsap.to(mesh.position, { x: 0, duration: 1, delay: 2 });
const tick = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();
