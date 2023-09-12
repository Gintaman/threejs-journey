import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { PlaneGeometry } from "three";

THREE.ColorManagement.enabled = false;

const ONE_QUARTER = Math.PI / 4;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load("./textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
    "./textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("./textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("./textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load(
    "./textures/door/metalness.jpg"
);
const doorRoughnessTexture = textureLoader.load(
    "./textures/door/roughness.jpg"
);

const bricksColorTexture = textureLoader.load("./textures/bricks/color.jpg");
const bricksAmbientCollusionTexture = textureLoader.load(
    "./textures/bricks/ambientOcclusion.jpg"
);
const bricksNormalTexture = textureLoader.load("./textures/bricks/normal.jpg");
const bricksRoughnessTexture = textureLoader.load(
    "./textures/bricks/roughness.jpg"
);

const grassColorTexture = textureLoader.load("./textures/grass/color.jpg");
const grassAmbientCollusionTexture = textureLoader.load(
    "./textures/grass/ambientOcclusion.jpg"
);
const grassNormalTexture = textureLoader.load("./textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load(
    "./textures/grass/roughness.jpg"
);

// need to repeat the grass texture (S and T are axes, need to repeat on both)
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientCollusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientCollusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.repeat.set(8, 8);
grassAmbientCollusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

/**
 * House
 */
// Temporary sphere
const house = new THREE.Group();
scene.add(house);

// fake ghosts using lights
const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
scene.add(ghost1);
scene.add(ghost2);
scene.add(ghost3);

const wallWidth = 4,
    wallHeight = 2.5,
    wallDepth = 4;
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth),
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientCollusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture,
    })
);
walls.position.y = wallHeight / 2;

// roof
const roofRadius = 3.5,
    roofHeight = 1,
    roofSegments = 4;
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofRadius, roofHeight, roofSegments),
    new THREE.MeshStandardMaterial({ color: "#b35f45" })
);
// NOTE PI is half a rotation (180 deg), PI / 2 is 90 deg rotation, PI / 4 is 45
// NOTE #2, rotateY, because we're rotating across the Y axis. Y axis is thumb
// pointing up, imagine putting an umbrella on top of the thumb and spinning it
roof.rotateY(ONE_QUARTER);
// position is height of the walls (2.5) + half of height of the roof (0.5)
roof.position.y = wallHeight + roofHeight / 2;

// door
const doorHeight = 2.2,
    doorWidth = 2;
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorWidth, doorHeight, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalmap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    })
);
door.position.z = wallDepth / 2 + 0.0001;
door.position.y = doorHeight / 2 - 0.1;

// bushes
const bushRadius = 1;
const bushGeometry = new THREE.SphereGeometry(bushRadius, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(bushRadius / 2, bushRadius / 2, bushRadius / 2);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(bushRadius / 4, bushRadius / 4, bushRadius / 4);
bush2.position.set(1.4, 0.1, 2.1);

house.add(walls);
house.add(roof);
house.add(door);
house.add(bush1, bush2);

// gravestones
const graveyard = new THREE.Group();
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: "#b2b6b1" });

// imagine a circle centered around our house but within the bounds of
// the floor plane. we'll place gravestones randomly along that circle, +- some
// delta so that they are around the circle but necessarily directly on it
for (let i = 0; i < 30; i++) {
    // angle is random value between 0 and ~6
    const angle = Math.random() * Math.PI * 2;
    // Math.sin and Math.cos default to radius of 1, we need to make the
    // circle bigger
    const radius = 3 + Math.random() * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.castShadow = true;
    grave.position.set(x, 0.4, z);
    grave.rotateY(Math.random() - 0.5);
    grave.rotateZ(Math.random() - 0.5);
    graveyard.add(grave);
}
scene.add(graveyard);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        scale: 0.1,
        aoMap: grassAmbientCollusionTexture,
        map: grassColorTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

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
    renderer.setClearColor("#262837");
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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
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

// shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // * 0.5 slows down the ghosts speed
    const ghost1Angle = elapsedTime * 0.5;
    // * 4 increases the radius of the circle the ghost follows
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = elapsedTime * 0.18;
    ghost3.position.x =
        Math.cos(ghost3Angle) * (7 * Math.sin(elapsedTime * 0.32));
    ghost3.position.z =
        Math.sin(ghost3Angle) * (7 * Math.sin(elapsedTime * 0.32));
    ghost3.position.y = Math.sin(elapsedTime * 5) * Math.sin(elapsedTime * 2);

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
