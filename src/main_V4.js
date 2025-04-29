import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

/* ---------------------------------
   Canvas / sizes
----------------------------------*/
const canvas = document.querySelector("#experience-canvas");
const sizes = { width: window.innerWidth, height: window.innerHeight };

/* ---------------------------------
   Scene, Camera, Renderer
----------------------------------*/
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(2, 1.5, 4);           // Pull back a bit
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;  // Correct gamma

/* ---------------------------------
   Lights — at least one!
----------------------------------*/
const keyLight = new THREE.DirectionalLight(0xffffff, 0.1);
keyLight.position.set(5, 10, 10);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
fillLight.position.set(-10, 5, 5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x88aaff, 0.1);
rimLight.position.set(0, 10, -10);
scene.add(rimLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const cloudTexture = new THREE.TextureLoader().load("/textures/cloud.png");

function createCloud(x, y, z, scale = 1) {
  const cloudMaterial = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.6 });
  const cloud = new THREE.Sprite(cloudMaterial);
  cloud.position.set(x, y, z);
  cloud.scale.set(scale, scale, 10);
  return cloud;
}

const cloud1 = createCloud(0, 1, -1, 4);
const cloud2 = createCloud(1, 1, 2, 4);
const cloud3 = createCloud(2, 1, 1, 4);

scene.add(cloud1);
scene.add(cloud2);
scene.add(cloud3);

/* ---------------------------------
   OrbitControls
----------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------------------------------
   Loaders
----------------------------------*/
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/* ---------------------------------
   Handle window resize
----------------------------------*/
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

console.log(camera.position)
console.log("000000000")
console.log(controls.target)

/* ---------------------------------
   Load the GLB model
----------------------------------*/
// Create the video element
const videoElement = document.createElement("video");
videoElement.src = "/textures/room/video/Jw.mp4";
videoElement.loop = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.muted = true; // optional but helps autoplay work better
videoElement.play()
  .then(() => {
    console.log("Video started playing.");
  })
  .catch((err) => {
    console.error("Video play error:", err);
  });

// Create a video texture
const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.anisotropy = 16;
videoTexture.encoding = THREE.sRGBEncoding;
videoTexture.flipY = true; // << FIX: Correct orientation

// Load the GLB model
gltfLoader.load(
  "/models/Portfolio_Room.glb",
  (gltf) => {
    scene.add(gltf.scene);

    gltf.scene.traverse((child) => {
      console.log(child.name, child.type);
    });

    const targetMesh = gltf.scene.getObjectByName("Imac_Screen");

    if (targetMesh && targetMesh.isMesh) {
        const videoMaterial = new THREE.MeshBasicMaterial({
          map: videoTexture,
          toneMapped: false,
        });
      
        targetMesh.material = videoMaterial;
      
       
      
        console.log("✅ Video texture successfully applied to Imac_Screen!");
      } else {
        console.warn("⚠️ Target mesh not found or not a mesh.");
      }
      

    animate(); // Start animation
  },
  (xhr) => {
    console.log(`GLB ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`);
  },
  (error) => console.error("GLB load error:", error)
);

  

// Load HDR environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load("/hdr/studio_small_03_2k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;  // for reflections, PBR materials
});


function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

