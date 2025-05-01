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
const sizes  = { width: window.innerWidth, height: window.innerHeight };


/* ---------------------------------
   Scene, Camera, Renderer
----------------------------------*/
const scene  = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(-7, 5, 8);         
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;  // correct gamma

/* ---------------------------------
   Lights — at least one!
----------------------------------*/


const keyLight = new THREE.DirectionalLight(0xffffff, 0.1);
keyLight.position.set(5, 10, 10);
keyLight.castShadow = true;
scene.add(keyLight);


// Fill Light - soft white
const fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
fillLight.position.set(-10, 5, 5);
scene.add(fillLight);



// Rim Light - blueish tint for style
const rimLight = new THREE.DirectionalLight(0x88aaff, 0.1);
rimLight.position.set(0, 10, -10);
scene.add(rimLight);

// Soft ambient light for general illumination
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

// Create cloud sprites and store references
const cloud1 = createCloud(0, 7, -2, 4);  // Raise cloud1 higher to y = 10
const cloud2 = createCloud(1, 7, -1, 4); // Raise cloud2 higher to y = 12
const cloud3 = createCloud(2, 7, 1, 4); // Raise cloud3 higher to y = 11

scene.add(cloud1);
scene.add(cloud2);
scene.add(cloud3);




/* ---------------------------------
   OrbitControls
----------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(0.04451427016691359,1.992258015338971,0.26919808674082935)


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
  sizes.width  = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render =() =>{
 controls.update();
 

 console.log (camera.position);
 console.log("000000000")
 console.log (controls.target);



}


function animate() {
   
   controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}




/* ---------------------------------
   Load the GLB model
----------------------------------*/
// Remove muted: true to allow audio when the video is played
const videoElement = document.createElement("video");
videoElement.src = "/textures/room/video/Jw.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true; // Good — already included
videoElement.autoplay = true;  // Remove muted: true if you want sound
videoElement.play()
  .then(() => {
    console.log("Video started playing.");
  })
  .catch((err) => {
    console.error("Video play error:", err);
  });

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.wrapS = THREE.RepeatWrapping;
videoTexture.repeat.x = -1;

// Ensure the video plays after a click event
window.addEventListener("click", () => {
  // Only play if not already playing
  if (videoElement.paused) {
    videoElement.play().catch((err) => {
      console.error("Video play blocked:", err);
    });
  }
});

// Your existing GLTF loading logic
gltfLoader.load(
  "/models/Room_Portfolio.glb",
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
    
      // 🛠️ NEW: Adjust targetMesh scale to fit video aspect ratio
      videoElement.addEventListener('loadedmetadata', () => {
        const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
        const meshAspect = targetMesh.scale.x / targetMesh.scale.y;
    
        if (videoAspect > meshAspect) {
          targetMesh.scale.y = targetMesh.scale.x / videoAspect;
        } else {
          targetMesh.scale.x = targetMesh.scale.y * videoAspect;
        }
      });
    
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





const rgbeLoader = new RGBELoader();
rgbeLoader.load("/hdr/studio_small_03_2k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = texture;         // for reflections, PBR materials
 
});

