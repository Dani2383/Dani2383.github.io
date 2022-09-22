/** Robot para la práctica 2 */

import * as Three from "../lib/three.module.js";

let renderer, scene, camera;

// Variables globales
let robot;
//Acciones
init();
loadScene();
render();

function init(){
    renderer = new Three.WebGLRenderer();
    console.log('Hola2');
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    scene.background = new Three.Color(0.5, 0.5, 0.5);

    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(90, 200, 350);
    camera.lookAt(new Three.Vector3(0, 0, 0));
}

function loadScene() {
    const matRobot = new Three.MeshBasicMaterial({ color: 'red', wireframe: true });
    const matSuelo = new Three.MeshBasicMaterial({ color: 'yellow', wireframe: true });

    //suelo
    const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 100, 100), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);
    suelo.position.y = -0.2;

    //Partes del robot:
    robot = new Three.Object3D();
    robot.position.x = 0;
    robot.position.y = 1;

    //Base del robot:
    const base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 20, 20), matRobot);


    robot.add(base);
    scene.add(robot);
    scene.add(new Three.AxesHelper(3));
}

function render() {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}