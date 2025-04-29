import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

/* ---------------------------------
   Canvas, Scene, Camera, Renderer
----------------------------------*/
const canvas = document.querySelector("#experience-canvas");
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 1.5, 4);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

/* ---------------------------------
   Lights
----------------------------------*/
const lights = [
  new THREE.DirectionalLight(0xffffff, 0.1),
  new THREE.DirectionalLight(0xffffff, 0.1),
  new THREE.DirectionalLight(0x88aaff, 0.1),
  new THREE.AmbientLight(0xffffff, 0.1),
];

lights[0].position.set(5, 10, 10);    // key light
lights[1].position.set(-10, 5, 5);    // fill light
lights[2].position.set(0, 10, -10);   // rim light

lights.forEach(light => scene.add(light));

/* ---------------------------------
   Clouds
----------------------------------*/
const cloudTexture = new THREE.TextureLoader().load("/textures/cloud.png");

function createCloud(x, y, z, scale = 1) {
  const material = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.6 });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(scale, scale, 10);
  return sprite;
}

scene.add(
  createCloud(0, 8, -1, 4),
  createCloud(1, 8, 2, 4),
  createCloud(2, 8, 1, 4)
);

/* ---------------------------------
   Orbit Controls
----------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------------------------------
   Video Setup
----------------------------------*/
const videoElement = document.createElement("video");
videoElement.src = "/textures/room/video/Jw.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play().catch(console.error);

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;

/* ---------------------------------
   Loaders
----------------------------------*/
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/* ---------------------------------
   Load Environment
----------------------------------*/
new RGBELoader().load("/hdr/studio_small_03_2k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

/* ---------------------------------
   Load GLTF Model
----------------------------------*/
gltfLoader.load(
  "/models/Portfolio_Room.glb",
  (gltf) => {
    scene.add(gltf.scene);

    // DEBUG: See names and types
    gltf.scene.traverse((child) => {
      console.log(child.name, child.type);
    });

    const targetMesh = gltf.scene.getObjectByName("Imac_Screen");

    if (targetMesh && targetMesh.isMesh) {
      const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        toneMapped: false, // VERY important: video should NOT be tone mapped
      });

      targetMesh.material = videoMaterial;

      console.log("✅ Video texture successfully applied to Imac_Screen (with MeshBasicMaterial)!");
    } else {
      console.warn("⚠️ Target mesh not found or not a mesh.");
    }

    // Start animation after the model is loaded
    animate();  // Call the animate function here
  },
  (xhr) => {
    console.log(`GLB ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`);
  },
  (error) => console.error("GLB load error:", error)
);






