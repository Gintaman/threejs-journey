import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import gsap from "gsap";
import {
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshToonMaterial,
    TorusGeometry,
} from "three";

// Added per june update
THREE.ColorManagement.enabled = false;
const gui = new GUI();

const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
    "/textures/door/ambientOcclusion.jpg"
);
const doorheightTexture = textureLoader.load("/textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const matcapTexture = textureLoader.load("/textures/matcaps/1.png");
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

const cubeTextureLoader = new THREE.CubeTextureLoader();
// needs to be in the correct order.
// px => positive x
// nx => negative x
// ... etc
const envMapTexture = cubeTextureLoader.load([
    "textures/environmentMaps/0/px.jpg",
    "textures/environmentMaps/0/nx.jpg",
    "textures/environmentMaps/0/py.jpg",
    "textures/environmentMaps/0/ny.jpg",
    "textures/environmentMaps/0/pz.jpg",
    "textures/environmentMaps/0/nz.jpg",
]);

const canvas = document.querySelector(".webgl");

const scene = new THREE.Scene();

/*
const material = new THREE.MeshBasicMaterial();
material.map = doorColorTexture;
material.transparent = true;
material.alphaMap = doorAlphaTexture;
material.side = THREE.DoubleSide;
*/

/*
// normals can be used for lighting, reflection , refraction etc
// useful for debugging normals
const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;
*/

/*
// MeshMatcapMaterial uses normals to apply lighting
// to create our own matcap for a sphere, go into blender, put a camera in front of a sphere,
// apply lighting and render it
const material = new THREE.MeshMatcapMaterial();
material.matcap = matcapTexture;
*/

/*
// renders brighter closer camera is to object
const material = new THREE.MeshDepthMaterial();
*/

// some really cool materials, MeshToonMaterial kinda cool

/*
// MeshLambertMaterial has new properties related to lights
const material = new MeshLambertMaterial();
*/

/*
// MORE performant than meshstandard or meshphysical at the cost of some accuracy,
// but may be less than meshlambert
const material = new MeshPhongMaterial();
material.shininess = 100;
material.specular = new THREE.Color(0xff0000);
*/

/*
const material = new MeshToonMaterial();
material.gradientMap = gradientTexture;
*/

/*
const material = new THREE.MeshStandardMaterial();
// shouldn't use these in tandem with metlanessMap and roughnessMAp
// material.metalness = 0.45;
// material.roughness = 0.65;

material.map = doorColorTexture;
// this causes the crevices and cracks to appear darker
material.aoMap = doorAmbientOcclusionTexture;
material.aoMapIntensity = 1;
material.displacementMap = doorheightTexture;
material.displacementScale = 0.05;
material.metalnessMap = doorMetalnessTexture;
material.roughnessMap = doorRoughnessTexture;
material.normalMap = doorNormalTexture;
// normalmap adds the depth of the cracks and stuff
material.normalScale.set(0.5, 0.5);

// so this makes the plane geometry only show the door and removes the stuff around the door jpg
// but it also needs material.transparent = true to work
material.transparent = true;
material.alphaMap = doorAlphaTexture;
*/

// environment maps very cool
const material = new THREE.MeshStandardMaterial();
material.metalness = 0.7;
material.roughness = 0.2;
material.envMap = envMapTexture;

gui.add(material, "metalness").min(0).max(1).step(0.0001);
gui.add(material, "roughness").min(0).max(1).step(0.0001);
gui.add(material, "aoMapIntensity").min(0).max(2).step(0.0001);
gui.add(material, "displacementScale").min(0).max(1).step(0.0001);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
const torus = new THREE.Mesh(new TorusGeometry(0.3, 0.2, 16, 32), material);

// needed to add this to make the ao map work, most likely due to older version of threejs
sphere.geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);

plane.geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);

torus.geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

sphere.position.x = -1.5;
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

// lights lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// y axis goes upward, x axis goes to the right, z axis goes towards us
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
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Axes helper (visualizes axes)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
    canvas,
});

renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// limit pixel ratio to max of 2 (usually > 2 on mobile)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    /*
    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    plane.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;
    */
    controls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
