import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("./textures/particles/2.png");

// particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
    alphaMap: particleTexture,
    transparent: true,
    size: 0.1,
    sizeAttenuation: true,
    //color: "#ff88cc",

    // currently GPU is drawing particles over other ones, which can cause them to be covered
    // this tells GPU to not render the black square around the texture file, based on testing alpha
    // alphaTest: 0.001,

    // another fix is to use detphTest, but deactivating can cause bugs if there are other objects
    // for example, if we add a cube after drawing the particles, the cube is see-through
    // this tells GPU to just draw particles, not care about whtas in front or behind
    // depthTest: false,

    // this tells webgl not to draw particles inside the depth buffer
    depthWrite: false,

    // read up on blending. can be good for effects like sparkles, but may cause framerate drop
    blending: THREE.AdditiveBlending,

    // need this for setAttribute 'color' to work
    vertexColors: true,
});
const count = 100;

// 1-d array. count * 3 because we'll have segments of 3, containing x y z coords
// [x1, y1, z1, x2, y2, z2...]
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
    // - 0.5 to make a value between -0.5 to 0.5 (so we have negatives)
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random(); // RGB just goes between 0 and 1
}
// quick refresher of using buffergeometry
particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3) // 3 here again, see segments comment above
);
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/*
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial()
);
scene.add(cube);
*/

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // update particles (this updates all the particles)
    // particles.position.y = -elapsedTime * 0.2;
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // x: i3
        // y: i3 + 1
        // z: i3 + 2
        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(
            elapsedTime + x // gives a wave effect, need to brush up on math
        );
        // this is very poor performance, don't do it, there's better ways
        // should use a custom shader instead
    }
    // need to call needsUpdate here to tell threejs to update before rendering
    particlesGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
