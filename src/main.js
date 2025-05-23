  import "./style.scss";
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
  import gsap from "gsap";

  /* ---------------------------------
    Setup: Canvas, Sizes, Clock
  ----------------------------------*/
  const canvas = document.querySelector("#experience-canvas");
  const sizes = { width: window.innerWidth, height: window.innerHeight };
  const clock = new THREE.Clock();
  let mixer;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
  camera.position.set(-7, 5, 8);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  /* ---------------------------------
    Controls
  ----------------------------------*/
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0.0445, 1.992, 0.269);
controls.minPolarAngle = 0;           // camera can't go below looking straight down
controls.maxPolarAngle = Math.PI / 2;
  /* ---------------------------------
    Lights
  ----------------------------------*/
  const lights = [
    new THREE.DirectionalLight(0xffffff, 0.1).position.set(5, 10, 10),
    new THREE.DirectionalLight(0xffffff, 0.1).position.set(-10, 5, 5),
    new THREE.DirectionalLight(0x88aaff, 0.1).position.set(0, 10, -10),
    new THREE.AmbientLight(0xffffff, 0.1)
  ];
  lights.forEach(light => scene.add(light));

  /* ---------------------------------
    Clouds
  ----------------------------------*/
  const cloudTexture = new THREE.TextureLoader().load("/textures/cloud.png");
  function createCloud(x, y, z, scale = 1) {
    const material = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.6 });
    const cloud = new THREE.Sprite(material);
    cloud.position.set(x, y, z);
    cloud.scale.set(scale, scale, 10);
    return cloud;
  }
  scene.add(createCloud(0, 7, -2, 4), createCloud(1, 7, -1, 4), createCloud(2, 7, 1, 4));

  /* ---------------------------------
    Raycasting
  ----------------------------------*/
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const raycasterObjects = [];
  let scaledHoverObjects = new Set();

  window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

  
 
  /* ---------------------------------
    Resize Handling
  ----------------------------------*/
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
  });

  /* ---------------------------------
    Modals
  ----------------------------------*/
 
  const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact"),
    folder: document.querySelector(".modal.folder"),
    imac: document.querySelector(".modal.imac"),
  };
const showModal = (modal) => {
  gsap.killTweensOf(modal);
  modal.style.display = "flex";
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 });

  // Slider init
  if (modal.classList.contains("work")) initWorkModalSlider();
  if (modal.classList.contains("imac")) initImacModalSlider();
};

const hideModal = (modal) => {
  gsap.killTweensOf(modal); // Clear previous tweens
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
      modal.style.opacity = ""; // Clean up
    },
  });
};

 document.body.addEventListener("click", (e) => {
  const exitBtn = e.target.closest(".modal-exit-button");
  if (exitBtn) {
    const modal = exitBtn.closest(".modal");
    if (modal) hideModal(modal);
  }

  // Also handle click outside modal content to close it
  const modal = e.target.closest(".modal");
  if (modal && e.target === modal) {
    hideModal(modal);
  }
});


  /* ---------------------------------
    Social Links
  ----------------------------------*/
  const socialLinks = {
    "Fb_Raycaster": "https://www.facebook.com/adrian.castillo2",
    "Fb_Raycaster_Hover": "https://www.facebook.com/adrian.castillo2",
    "Insta_Raycaster": "https://www.instagram.com/a.sidebk",
    "Insta_Raycaster_Hover": "https://www.instagram.com/a.sidebk"
  };

  /* ---------------------------------
    Video Texture
  ----------------------------------*/
  const videoElement = document.createElement("video");
  videoElement.src = "/textures/room/video/Bb.mp4";
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.autoplay = true;
  videoElement.play();
  const videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.wrapS = THREE.RepeatWrapping;
  videoTexture.repeat.x = -1;

  /* ---------------------------------
    Loaders
  ----------------------------------*/
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const loadingManager = new THREE.LoadingManager();
  const gltfLoader = new GLTFLoader(loadingManager);
  
  gltfLoader.setDRACOLoader(dracoLoader);
  loadingManager.onProgress = (url, loaded, total) => {
  const percent = Math.round((loaded / total) * 100);
  document.querySelector(".progress").style.width = `${percent}%`;
};
loadingManager.onProgress = (url, loaded, total) => {
  const percent = Math.round((loaded / total) * 100);
  const progressBar = document.querySelector(".progress");
  const loadingText = document.getElementById("loading-text");
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (loadingText) loadingText.textContent = `Loading ${percent}%`;
  console.log(`Loading progress: ${percent}%`);
};

loadingManager.onLoad = () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 500);
};

const animatedOnLoad = new Set();

function animateRaycasterButtonsOnLoad() {
  raycasterObjects.forEach((obj, index) => {
    if (animatedOnLoad.has(obj)) return; // Already animated

    const targetScale = obj.userData.initialScale?.clone() || new THREE.Vector3(1, 1, 1);

    // Start from zero scale for entrance animation
    obj.scale.set(0, 0, 0);

    gsap.to(obj.scale, {
      x: targetScale.x,
      y: targetScale.y,
      z: targetScale.z,
      duration: 1,
      ease: "back.out(1.7)",
      delay: index * 0.1,
      onComplete: () => {
        animatedOnLoad.add(obj);
      }
    });
  });
}




  /* ---------------------------------
    GLTF Load
  ----------------------------------*/
function prepareRaycasterMesh(object, name) {
  if (!object) return console.warn(`⚠️ ${name} not found.`);
  object.traverse(child => {
    if (child.isMesh) {
      // Always store initial scale
      child.userData.initialScale = child.scale.clone();

      if (!child.material.emissive) {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0xffffff),
          emissive: new THREE.Color(0x000000),
          metalness: 0.2,
          roughness: 0.5,
        });
      }
      child.userData.parentGroup = object;
      raycasterObjects.push(child);
    }
  });
}


  gltfLoader.load(
    "/models/Room_Animate_New.glb",
    (gltf) => {
      scene.add(gltf.scene);
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.timeScale = 0.2;
        action.play();
      });

window.addEventListener("click", (event) => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects, true);

  if (intersects.length === 0) return;

  const clickedObject = intersects[0].object;
  const name = clickedObject.name;

  const interactiveNames = [
    "Work_Raycaster", "Work_Raycaster_Hover",
    "About_Raycaster", "About_Raycaster_Hover",
    "Contact_Raycaster", "Contact_Raycaster_Hover",
    "Folder_Raycaster", "Folder_Raycaster_Hover",
    "Imac_Raycaster", "Imac_Raycaster_Hover"
  ];

  if (!interactiveNames.includes(name)) return;

  switch (name) {
    case "Work_Raycaster":
    case "Work_Raycaster_Hover":
      showModal(modals.work);
      break;
    case "About_Raycaster":
    case "About_Raycaster_Hover":
      showModal(modals.about);
      break;
    case "Contact_Raycaster":
    case "Contact_Raycaster_Hover":
      showModal(modals.contact);
      break;
    case "Folder_Raycaster":
    case "Folder_Raycaster_Hover":
      showModal(modals.folder);
      break;
    case "Imac_Raycaster":
    case "Imac_Raycaster_Hover":
      showModal(modals.imac);
      break;
  }
});

window.addEventListener("touchend", (event) => {
  // Map to pointer
  const touch = event.changedTouches[0];
  pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects, true);

  if (intersects.length > 0) {
    const name = intersects[0].object.name;
    const modalMap = {
      Work_Raycaster: modals.work,
      Work_Raycaster_Hover: modals.work,
      About_Raycaster: modals.about,
      About_Raycaster_Hover: modals.about,
      Contact_Raycaster: modals.contact,
      Contact_Raycaster_Hover: modals.contact,
      Folder_Raycaster: modals.folder,
      Folder_Raycaster_Hover: modals.folder,
      Imac_Raycaster: modals.imac,
      Imac_Raycaster_Hover: modals.imac,
    };

    if (modalMap[name]) showModal(modalMap[name]);
  }
});



  gltf.scene.traverse((child) => {
    if (child.name.endsWith("_Hover")) {
      
      
      child.userData.initialScale = child.scale.clone();
      child.userData.initialPosition = child.position.clone();
      child.userData.initialRotation = child.rotation.clone();
      child.userData.isAnimating = false;
    }
  });

      const targetMesh = gltf.scene.getObjectByName("Imac_Screen");
      if (targetMesh?.isMesh) {
        targetMesh.material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
        videoElement.addEventListener("loadedmetadata", () => {
          const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
          const meshAspect = targetMesh.scale.x / targetMesh.scale.y;
          if (videoAspect > meshAspect) {
            targetMesh.scale.y = targetMesh.scale.x / videoAspect;
          } else {
            targetMesh.scale.x = targetMesh.scale.y * videoAspect;
          }
        });
      }

      const targets = [
        "Insta_Raycaster", "Fb_Raycaster", "Folder_Raycaster", "Imac_Raycaster", "Mouse_Raycaster",
        "Work_Raycaster", "About_Raycaster", "Contact_Raycaster",
        "Work_Raycaster_Hover", "About_Raycaster_Hover", "Contact_Raycaster_Hover",
        "Folder_Raycaster_Hover", "Fb_Raycaster_Hover", "Insta_Raycaster_Hover", "Imac_Raycaster_Hover"
      ];
      targets.forEach(name => prepareRaycasterMesh(gltf.scene.getObjectByName(name), name));

      targets.forEach(name => prepareRaycasterMesh(gltf.scene.getObjectByName(name), name));

      animateRaycasterButtonsOnLoad(); // Animate raycaster buttons on load

      animate(); // Start render loop

      

    },
    xhr => console.log(`GLB ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`),
    err => console.error("GLB load error:", err)
  );

  /* ---------------------------------
    Environment
  ----------------------------------*/
  new RGBELoader().load("/hdr/studio_small_03_2k.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });
  const MAX_HOVER_SCALE = 3; // 150% of original size max


  /* ---------------------------------
    Animate Loop
  ----------------------------------*/
  function animate() {
    const delta = clock.getDelta();
    controls.update();
    if (mixer) mixer.update(delta);

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(raycasterObjects);
    let currentHovered = new Set();

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const parent = hit.userData.parentGroup || hit;

      parent.traverse((child) => {
        if (
          child.isMesh &&
          child.material.emissive &&
          child.name.endsWith("_Hover")
        ) {
          // Mark as currently hovered
          currentHovered.add(child);

          // Set emissive color if not already set
          child.material.emissive.set(0xff0000);

          // Scale up if not already scaled
         if (!scaledHoverObjects.has(child)) {
  const initialScale = child.userData.initialScale || new THREE.Vector3(1, 1, 1);
  const targetScale = new THREE.Vector3().copy(initialScale).multiplyScalar(1.4);

  // Clamp to max
  targetScale.x = Math.min(targetScale.x, MAX_HOVER_SCALE);
  targetScale.y = Math.min(targetScale.y, MAX_HOVER_SCALE);
  targetScale.z = Math.min(targetScale.z, MAX_HOVER_SCALE);

  // Only animate if current scale is different
  if (!child.scale.equals(targetScale)) {
    gsap.killTweensOf(child.scale); // Kill any in-progress tween on this object
    gsap.to(child.scale, {
      x: targetScale.x,
      y: targetScale.y,
      z: targetScale.z,
      duration: 0.3,
      ease: "power2.out"
    });
  }

  scaledHoverObjects.add(child);
}

        }
      });

      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }

    // Reset emissive and scale for un-hovered objects
    scaledHoverObjects.forEach((obj) => {
    if (!currentHovered.has(obj)) {
  const originalScale = obj.userData.initialScale || new THREE.Vector3(1, 1, 1);
  
  if (!obj.scale.equals(originalScale)) {
    gsap.killTweensOf(obj.scale);
    gsap.to(obj.scale, {
      x: originalScale.x,
      y: originalScale.y,
      z: originalScale.z,
      duration: 0.3,
      ease: "power2.out"
    });
  }

  obj.material.emissive.set(0x000000);
  scaledHoverObjects.delete(obj);
}

    });


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  /* ---------------------------------
    Interactions
  ----------------------------------*/


let sliderInitialized = false;

function setupSlider(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  const track = modal.querySelector('.slider-track');
  const slides = modal.querySelectorAll('.slide');
  const prevBtn = modal.querySelector('.slider-button.prev');
  const nextBtn = modal.querySelector('.slider-button.next');
  let index = 0;

  function updateSlider() {
    const width = slides[0].offsetWidth;
    track.style.transform = `translateX(-${index * width}px)`;
  }

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateSlider();
  });

  window.addEventListener('resize', updateSlider);
}
setupSlider('.modal.work');
setupSlider('.modal.imac');


  // Optional: mark slider as initialized to prevent duplicates
  imacModal.dataset.sliderInitialized = "true";



  // Initialize style
  track.style.display = "flex";
  track.style.transition = "transform 0.3s ease";
  slides.forEach(slide => {
    slide.style.minWidth = "100%";
  });


  
  // MutationObserver to reset on open
  const observer = new MutationObserver(() => {
    if (workModal.style.display === "block") {
      currentIndex = 0;
      updateSlider();
    }
  });

  observer.observe(workModal, { attributes: true, attributeFilter: ["style"] });


// Call once
document.addEventListener("DOMContentLoaded", initWorkModalSlider);

// Updated modal click handling
document.body.addEventListener("click", (e) => {
  // Close modal on exit button
  if (e.target.closest(".modal-exit-button")) {
    const modal = e.target.closest(".modal");
    if (modal) {
      hideModal(modal);
      return;
    }
  }

  // Close modal if clicking outside modal content
  Object.values(modals).forEach((modal) => {
    if (modal.style.display === "block" && e.target === modal) {
      hideModal(modal);
    }
  });
});


  

  // Run after DOM is loaded or after modal logic is setup
  document.addEventListener("DOMContentLoaded", initWorkModalSlider);




window.addEventListener("click", () => {
  const intersects = raycaster.intersectObjects(raycasterObjects);
  if (intersects.length === 0) return;

  const object = intersects[0].object;
  const objectName = object.name;
  const baseName = objectName.replace("_Hover", "");

  // Allow clicking modal links even if a modal is open
  if (socialLinks[objectName] || socialLinks[baseName]) {
    const link = socialLinks[objectName] || socialLinks[baseName];
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  // Don't open multiple modals at once
  if (Object.values(modals).some(modal => modal.style.display === "block")) return;

  switch (baseName) {
    case "Work_Raycaster": showModal(modals.work); break;
    case "About_Raycaster": showModal(modals.about); break;
    case "Contact_Raycaster": showModal(modals.contact); break;
    case "Folder_Raycaster": showModal(modals.folder); break;
  }

  if (videoElement.paused) {
    videoElement.play().catch(err => console.error("Video play blocked:", err));
  }
});
