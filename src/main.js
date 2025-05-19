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

  
  window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
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
  };
const showModal = (modal) => {
  gsap.killTweensOf(modal); // Clear previous tweens
  modal.style.display = "flex"; // Ensure it's visible
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
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


  /* ---------------------------------
    GLTF Load
  ----------------------------------*/
  function prepareRaycasterMesh(object, name) {
    if (!object) return console.warn(`⚠️ ${name} not found.`);
    object.traverse(child => {
      if (child.isMesh) {
      

        // Add hover-specific data and materials
        if (child.name.endsWith("_Hover")) {
          child.userData.initialScale = child.scale.clone();
          child.userData.initialPosition = child.position.clone();
        }

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

      window.addEventListener("click", () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const name = clickedObject.name;

    switch (name) {
      case "About_Raycaster":
      case "About_Raycaster_Hover":
        showModal(modals.about);
        break;

      case "Contact_Raycaster":
      case "Contact_Raycaster_Hover":
        showModal(modals.contact);
        break;

      case "Work_Raycaster":
      case "Work_Raycaster_Hover":
        showModal(modals.work);
        break;

      case "Folder_Raycaster":
      case "Folder_Raycaster_Hover":
        showModal(modals.folder);
        break;

      default:
        console.log("No modal assigned to this object:", name);
    }
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
        "Folder_Raycaster_Hover", "Fb_Raycaster_Hover", "Insta_Raycaster_Hover"
      ];
      targets.forEach(name => prepareRaycasterMesh(gltf.scene.getObjectByName(name), name));

      animate();
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

            gsap.to(child.scale, {
              x: targetScale.x,
              y: targetScale.y,
              z: targetScale.z,
              duration: 0.3,
              ease: "power2.out"
            });

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
        // Reset scale
        const originalScale = obj.userData.initialScale || new THREE.Vector3(1, 1, 1);
        gsap.to(obj.scale, {
          x: originalScale.x,
          y: originalScale.y,
          z: originalScale.z,
          duration: 0.3,
          ease: "power2.out"
        });

        // Reset emissive color
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

function initWorkModalSlider() {
  if (sliderInitialized) return; // Prevent multiple inits
  sliderInitialized = true;

  const workModal = document.querySelector(".modal.work");
  const track = workModal.querySelector(".slider-track");
  const slides = workModal.querySelectorAll(".slide");
  const prevBtn = workModal.querySelector(".slider-button.prev");
  const nextBtn = workModal.querySelector(".slider-button.next");

  if (!track || !prevBtn || !nextBtn) {
    console.warn("Slider elements not found in Work modal.");
    return;
  }

  let currentIndex = 0;

  function updateSlider() {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateSlider();
    }
  });

  // MutationObserver to reset on open
  const observer = new MutationObserver(() => {
    if (workModal.style.display === "block") {
      currentIndex = 0;
      updateSlider();
    }
  });

  observer.observe(workModal, { attributes: true, attributeFilter: ["style"] });
}

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
