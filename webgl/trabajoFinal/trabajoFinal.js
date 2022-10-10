import * as Three from "../lib/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js";
import { TWEEN } from "../lib/tween.module.min.js";
import Stats from "../lib/stats.module.js";
//import { GUI } from "../lib/lil-gui.module.min.js";

//Variables globales
let renderer, scene, camera, planta;

init();
loadScene();
render();

function init(){
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    
    scene = new Three.Scene();
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    let ar = window.innerWidth / window.innerHeight;

    camera = new Three.PerspectiveCamera(75, ar, 0.1, 1000);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    
    //Camara --> 
    camera.position.set(50, 90, 200);
    camera.lookAt(0,100,0);
    setTopCamera(ar);

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene(){
     let matSuelo = new THREE.MeshNormalMaterial();
     const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 10, 10), matSuelo);
     suelo.position.y = -0.2;


     // Anadir a escena:
     scene.add(suelo);
}

function render() {
    requestAnimationFrame( render );
    renderer.clear();
    
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);

    let side = window.innerWidth > window.innerHeight ? 1/4 * window.innerHeight : 1/4 * window.innerWidth;
    renderer.setViewport(0, window.innerHeight-side, side, side);
    renderer.render(scene, planta);
    TWEEN.update();
}

// Funciones auxiliares --> 

function setTopCamera(ar){
    let camaraOrtografica;
    if (ar > 1) camaraOrtografica = new Three.OrthographicCamera(-1/4*window.innerHeight, 1/4*window.innerHeight, 1/4*window.innerHeight, -1/4*window.innerHeight, -10, 10000);
    else camaraOrtografica = new Three.OrthographicCamera(-1/4*window.innerWidth, 1/4*window.innerWidth, 1/4*window.innerWidth, -1/4*window.innerWidth, -10, 10000);

    planta = camaraOrtografica.clone();
    planta.position.set(0,L*3,0);
    planta.lookAt(0,0,0);
    planta.up = new Three.Vector3(0,0,-1);

}