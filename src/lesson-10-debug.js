import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import gsap from "gsap";

const gui = new GUI();
const parameters = {
    color: 0xff0000,
    spin: () => {
        gsap.to(mesh.rotation, {
            y: mesh.rotation.y + Math.PI * 2,
            duration: 1,
        });
    },
};

const canvas = document.querySelector(".webgl");

// cursor
const cursor = {
    x: 0,
    y: 0,
};

window.addEventListener("mousemove", (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = -(e.clientY / sizes.height - 0.5);
});

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const material = new THREE.MeshBasicMaterial({
    color: parameters.color,
    wireframe: false,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// debug window
// provide an object, and the name of the property of the object to modify
gui.add(mesh.position, "y", -3, 3, 0.01).name("elevation");
// equivalent to above
gui.add(mesh.position, "x").min(-3).max(3).step(0.01);
// hides and shows the object
gui.add(mesh, "visible");
// toggles wireframe
gui.add(material, "wireframe");

// gui manipulates parameters object's color prop, and we update material to match
gui.addColor(parameters, "color").onChange(() => {
    material.color.set(parameters.color);
});

gui.add(parameters, "spin");

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
