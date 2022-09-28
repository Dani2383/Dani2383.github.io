/** Seminario 3: Escena con varias vistas */

// Modulos necesarios

import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";


// Variables de consenso
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angulo = 0;
let cameraControls;

// Acciones
init();
loadScene();
render();

function init() {
    // Instanciar el motor
    renderer = new THREE.WebGLRenderer();
    console.log("Hol4a");
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    //Instanciar la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 5, 10);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene() {
    const material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true});

    //Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10, 10, 10, 10), material);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);
    suelo.position.y = -0.2;

    //Cubo y esfera
    const cubo = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), material);

    esferaCubo = new THREE.Object3D();
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo);

    cubo.position.x = -1;
    esfera.position.x = 1;
    esferaCubo.position.y = 1.5;

    //Modelo importado en formato GLTF
    // const glloader = new GLTFLoader();
    // glloader.load('models/RobotExpressive.glb', function(gltf){
    //     gltf.scene.position.y = 1;
    //     gltf.scene.rotation.y = -Math.PI/2;
    //     esfera.add(gltf.scene);
    //     console.log('ROBOT');
    //     console.log(gltf);
    // });

    scene.add(new THREE.AxesHelper(3));
}

function update(){
    angulo += 0.01;
    esferaCubo.rotation.y = angulo;
}
function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}