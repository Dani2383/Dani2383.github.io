/** Seminario 2: Escena básica con geometrías predefinidas */

// Modulos necesarios

import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angulo = 0;

// Acciones
init();
loadScene();
render();

function init() {
    // Instanciar el motor
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    //Instanciar la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 0, 500);
    camera.lookAt(0,1,0);
}

function loadScene() {
    const material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true});

    //Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10, 10, 10, 10), material);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);

    //Cubo y esfera
    const cubo = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), material);

    esferaCubo = new Three.Object3D();
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);

    cubo.position.x = -1;
    esfera.position.x = 1;
    esferaCubo.position.y = 1.5;
    scene.add(new THREE.AxesHelper(3));
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}