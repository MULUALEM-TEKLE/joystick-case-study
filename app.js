import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js";
// import { nipplejs } from "./nipplejs.min.js";

// import nipplejs from "https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.9.1/nipplejs.min.js";

// console.log(nipplejs);

// vars
let fwdValue = 0;
let bkdValue = 0;
let rgtValue = 0;
let lftValue = 0;
let tempVector = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
let joyManager;

var width = window.innerWidth,
  height = window.innerHeight;

// Create a renderer and add it to the DOM.
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
// Create the scene
var scene = new THREE.Scene();
// Create a camera
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.z = 50;
camera.position.y = 50;

scene.add(camera);

// Create a light, set its position, and add it to the scene.
var light = new THREE.PointLight(0xffffff);
light.position.set(-100, 200, 100);
scene.add(light);

// Add OrbitControls so that we can pan around with the mouse.
var controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 100;
controls.minDistance = 100;
//controls.maxPolarAngle = (Math.PI / 4) * 3;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;
controls.autoRotate = false;
controls.autoRotateSpeed = 0;
controls.rotateSpeed = 0.4;
controls.enableDamping = false;
controls.dampingFactor = 0.1;
controls.enableZoom = false;
controls.enablePan = false;
controls.minAzimuthAngle = -Math.PI / 2; // radians
controls.maxAzimuthAngle = Math.PI / 4; // radians

// Add axes
var axes = new THREE.AxesHelper(50);
scene.add(axes);

// Add grid
const size = 500;
const divisions = 30;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

var geometry = new THREE.SphereGeometry(5);
var cubeMaterial = new THREE.MeshNormalMaterial();

var mesh = new THREE.Mesh(geometry, cubeMaterial);
scene.add(mesh);

//var ground = new Object3D()
let size_floor = 100;
var geometry_floor = new THREE.BoxGeometry(size_floor, 1, size_floor);
var material_floor = new THREE.MeshNormalMaterial();

var floor = new THREE.Mesh(geometry_floor, material_floor);
floor.position.y = -5;
floor.visible = false;
//ground.add(floor)
scene.add(floor);
//floor.rotation.x = -Math.PI / 2

resize();
animate();
window.addEventListener("resize", resize);

// added joystick + movement
addJoystick();

function resize() {
  let w = window.innerWidth;
  let h = window.innerHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// Renders the scene
function animate() {
  updatePlayer();
  renderer.render(scene, camera);
  controls.update();

  requestAnimationFrame(animate);
}

function updatePlayer() {
  // move the player
  const angle = controls.getAzimuthalAngle();

  if (fwdValue > 0) {
    tempVector.set(0, 0, -fwdValue).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  if (bkdValue > 0) {
    tempVector.set(0, 0, bkdValue).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  if (lftValue > 0) {
    tempVector.set(-lftValue, 0, 0).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  if (rgtValue > 0) {
    tempVector.set(rgtValue, 0, 0).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  mesh.updateMatrixWorld();

  //controls.target.set( mesh.position.x, mesh.position.y, mesh.position.z );
  // reposition camera
  camera.position.sub(controls.target);
  controls.target.copy(mesh.position);
  camera.position.add(mesh.position);
}

function addJoystick() {
  const options = {
    zone: document.getElementById("joystickWrapper1"),
    size: 120,
    multitouch: true,
    maxNumberOfNipples: 2,
    mode: "static",
    restJoystick: true,
    shape: "circle",
    // position: { top: 20, left: 20 },
    position: { top: "60px", left: "60px" },
    dynamicPage: true,
  };

  joyManager = nipplejs.create(options);

  joyManager["0"].on("move", function (evt, data) {
    const forward = data.vector.y;
    const turn = data.vector.x;

    if (forward > 0) {
      fwdValue = Math.abs(forward);
      bkdValue = 0;
    } else if (forward < 0) {
      fwdValue = 0;
      bkdValue = Math.abs(forward);
    }

    if (turn > 0) {
      lftValue = 0;
      rgtValue = Math.abs(turn);
    } else if (turn < 0) {
      lftValue = Math.abs(turn);
      rgtValue = 0;
    }
  });

  joyManager["0"].on("end", function (evt) {
    bkdValue = 0;
    fwdValue = 0;
    lftValue = 0;
    rgtValue = 0;
  });
}
