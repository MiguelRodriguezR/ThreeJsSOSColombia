import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from 'gsap'


// TEXT

gsap.from("#hashtag", {
  y: 50,
  duration: 3, 
  delay: 7,
  ease: "power4.out"
});


/**
 * Loaders
 */
 const gltfLoader = new GLTFLoader(); 

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
dat.GUI.toggleHide();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x11111f, 0.002);

/**
 * Models
 */
// gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
    gltfLoader.load("/models/grave.gltf", (gltf) => {
        console.log("loaded");
        console.log(gltf);
      
        gltf.scene.scale.set(1,1,1);
        gltf.scene.position.set(0,-1.5,-1.3);
        gltf.scene.rotation.y = Math.PI * -0.5;
        gltf.scene.rotation.x = -0.7;
      
        scene.add(gltf.scene);
        gui.add(gltf.scene.position , 'x').min(-Math.PI).max(Math.PI).step(0.001).name('px')
        gui.add(gltf.scene.position , 'y').min(-Math.PI).max(Math.PI).step(0.001).name('py')
        gui.add(gltf.scene.position , 'z').min(-Math.PI).max(Math.PI).step(0.001).name('pz')
        gui.add(gltf.scene.rotation , 'y').min(-Math.PI).max(Math.PI).step(0.001).name('ry')
        gui.add(gltf.scene.rotation , 'x').min(-Math.PI).max(Math.PI).step(0.001).name('rx')
        gui.add(gltf.scene.rotation , 'z').min(-Math.PI).max(Math.PI).step(0.001).name('rz')
      
        updateAllMaterials();
      });

// Ambient Light
const ambient = new THREE.AmbientLight(0x1111111);
// scene.add(ambient);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0x1111111);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

// Point Light
const flash = new THREE.PointLight(0x062d89, 30, 900, 1.7);
flash.position.set(0, 0, 0);
scene.add(flash);

gui.add(flash.position, 'x').min(-500).max(500).step(1);
gui.add(flash.position, 'y').min(-500).max(500).step(1);
gui.add(flash.position, 'z').min(-500).max(500).step(1);

// Rain Drop Texture
const rainCount = 9500;
const cloudParticles = [];
const rainDropArray = [];
const rainGeo = new THREE.BufferGeometry();
const positionsArray = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  const i3 = i * 3;
  positionsArray[i3] = Math.random() * 400 - 200;
  (positionsArray[i3 + 1] = Math.random() * 500),
  (positionsArray[i3 + 2] = Math.random() * 400 - 450);

  const rainDrop = {};

//   rainDrop.position = new THREE.Vector3(
//     positionsArray[i3],
//     positionsArray[i3 + 1],
//     positionsArray[i3 + 2]
//   );

  rainDrop.velocity = 0;

  rainDropArray.push(rainDrop);
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
rainGeo.setAttribute("position", positionsAttribute);

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.3,
  transparent: true,
});

const rain = new THREE.Points(rainGeo, rainMaterial);
// rain.rotation.z = -Math.PI/8
rain.rotation.x = -Math.PI/4
scene.add(rain);

// Smoke Texture Loader
let loader = new THREE.TextureLoader();
loader.load(
  "https://raw.githubusercontent.com/navin-navi/codepen-assets/master/images/smoke.png",
  function (texture) {
    const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
    });

    for (let p = 0; p < 25; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 800 - 400,
        Math.random() * 500,
        -500,
      );
    //   cloud.rotation.x = 1.16;
    //   cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 2 * Math.PI;
      cloud.material.opacity = 0.55;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  }
);

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
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 1;
// camera.rotation.x = 1.16;
// camera.rotation.y = -0.12;
// camera.rotation.z = 0.27;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setClearColor(scene.fog.color);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const tick = () => {
  // Cloud Rotation Animation
  rotateClouds();

  // Lightening Animation
  lightening();

  // RainDrop Animation
  rainDropFall();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

const rotateClouds = () => {
    cloudParticles.forEach(p => {
        p.rotation.z -= 0.002;
      })
}

const rainDropFall = () => {
    // console.log(rainGeo);
    for (let i = 0; i < rainCount; i++) {
        const i3 = i * 3;
        rainDropArray[i].velocity -= 3 * Math.random() * 0.08;
        rainGeo.attributes.position.array[i3 + 1] += rainDropArray[i].velocity;
        // console.log(rainGeo.attributes.position.array[i3 + 1])
        if(rainGeo.attributes.position.array[i3 + 1] < -200){
            rainGeo.attributes.position.array[i3 + 1] = 300;
            rainDropArray[i].velocity = -5;
        }
    }
    rainGeo.attributes.position.needsUpdate = true;
    // rain.rotation.y += 0.002;
}

const lightening = () => {
    if(Math.random() > 0.96 || flash.power > 100) {
        if(flash.power<100) {
          flash.position.set(
            Math.random()*400,
            300+Math.random()*200,
            100
          );
        }
        flash.power = 50 + Math.random() * 500;
      }
      else{
          flash.power = 0;
      }
}

tick();
