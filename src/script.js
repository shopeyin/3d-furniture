import * as THREE from "three";
import * as dat from "lil-gui";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js'

THREE.ColorManagement.enabled = false;

gsap.registerPlugin(ScrollTrigger);

const red = document.querySelector(".red");
const blue = document.querySelector(".blue");
const white = document.querySelector(".white");

/**
 * Debug
//  */
const gui = new dat.GUI();
let modelFolder = gui.addFolder("Model Properties");
const global = {}




const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
          child.material.envMapIntensity = global.envMapIntensity
          
        }
    })
}

/**
 * Loaders
 */
// ...
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader()
/**
 * Environment map
 */
// Global intensity
global.envMapIntensity = 1
gui.add(global, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)
// LDR cube texture
// const environmentMap = cubeTextureLoader.load([
//   "/environmentMaps/3/standard/StandardCubeMap.hdr",
//   // "/environmentMaps/0/nx.png",
//   // "/environmentMaps/0/py.png",
//   // "/environmentMaps/0/ny.png",
//   // "/environmentMaps/0/pz.png",
//   // "/environmentMaps/0/nz.png",
// ]);

// HDR (RGBE) equirectangular
rgbeLoader.load(
  "/environmentMaps/2/2k.hdr",(environmentMap)=>{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
  //  scene.environment = environmentMap;

  //  const skybox = new GroundProjectedSkybox(environmentMap)
  //  skybox.scale.setScalar(50)
  //  scene.add(skybox)
  }
  // "/environmentMaps/0/nx.png",
  // "/environmentMaps/0/py.png",
  // "/environmentMaps/0/ny.png",
  // "/environmentMaps/0/pz.png",
  // "/environmentMaps/0/nz.png",
);

/**
 * Models
 */

const loadingManger = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader(loadingManger);
gltfLoader.setDRACOLoader(dracoLoader);

const INITIAL_MATERIAL = new THREE.MeshPhongMaterial({
  color: 0xf1f1f1,
  shininess: 10,
});

const modelObject = {};

gltfLoader.load("/models/chair.glb", (model) => {
  modelObject.name = model.scene;
  scene.add(model.scene);

  updateAllMaterials()
});

function traverseModel(model) {
  let children = [];
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      children.push(child);
    }
  });

  return children;
}

function shadow(children) {
  children.forEach((child) => {
    //child.material = INITIAL_MATERIAL;
    child.receiveShadow = true;
    child.castShadow = true;
  });
}
function changeColor(children, color) {
  children.forEach((child) => {
    child.material.color.setHex(color);
  });
}

const deskTopAnimation = () => {};

const setUpAnimation = (children) => {
  shadow(children);

  red.addEventListener("click", () => {
    changeColor(children, 0xff0000);
  });
  blue.addEventListener("click", () => {
    changeColor(children, 0x0000ff);
  });
  white.addEventListener("click", () => {
    changeColor(children, 0xf1f1f1);
  });

  // deskTopAnimation();
};

loadingManger.onLoad = () => {
  modelFolder
    .add(modelObject.name.position, "x")
    .min(-2)
    .max(2)
    .step(0.01)
    .name("X Position");
  modelFolder
    .add(modelObject.name.position, "y")
    .min(-2)
    .max(2)
    .step(0.01)
    .name("Y Position");
  modelFolder.add(modelObject.name.position, "z", -10, 10).name("Z Position");
  // modelFolder
  //   .add(models.flight.rotation, "x", 0, Math.PI * 2)
  //   .name("X Rotation");
  // modelFolder
  //   .add(models.flight.rotation, "y", 0, Math.PI * 2)
  //   .name("Y Rotation");
  // modelFolder
  //   .add(models.flight.rotation, "z", 0, Math.PI * 2)
  //   .name("Z Rotation");
  // modelFolder.add(models.flight.scale, "x", 0.1, 10).name("X Scale");
  // modelFolder.add(models.flight.scale, "y", 0.1, 10).name("Y Scale");
  // modelFolder.add(models.flight.scale, "z", 0.1, 10).name("Z Scale");

  // modelObject.name.material.envMap = environmentMap
  modelObject.name.position.y = -0.02;
  modelObject.name.scale.set(0.1, 0.1, 0.1);

  //modelObject.name.children[0].material.envMap = environmentMap

  let children = traverseModel(modelObject.name);
  setUpAnimation(children);
};

const parameters = {
  materialColor: "#ffeded",
};

// gui.addColor(parameters, "materialColor").onChange(() => {
//   material.color.set(parameters.materialColor);
// });
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

const BACKGROUND_COLOR = 0xf1f1f1;

// Scene
const scene = new THREE.Scene();
 scene.background = new THREE.Color(BACKGROUND_COLOR);
// scene.background = environmentMap;
// scene.environment = environmentMap;
/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.54);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(-2, 5, 5);
scene.add(directionalLight);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    metalness: 1,
    roughness: 0.3,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.4;

scene.add(floor);

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
  35,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.z = 4;
camera.position.y = 1;
// camera.lookAt(0, 0, 0);
// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 10
controls.minDistance = 3
controls.maxPolarAngle = Math.PI / 2
controls.autoRotate = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  //alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();
  //camera.lookAt(cameraTarget)
  // camera.position.y = - scrollY / sizes.height * objectsDistance

  //   for (const mesh of sectionMeshes) {
  //     mesh.rotation.x = elapsedTime * 0.1;
  //     mesh.rotation.y = elapsedTime * 0.12;
  //   }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
