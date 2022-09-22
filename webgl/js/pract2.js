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
    console.log('Hola4');
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    scene.background = new Three.Color(0.5, 0.5, 0.5);

    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(90, 100, 250);
    camera.lookAt(0,50,0);
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

    // Brazo:

    const brazo = new Three.Object3D();
    const eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matRobot);
    eje.rotation.x = Math.PI/2;

    const esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matRobot);
    esparrago.position.y = 60;

    const rotula = new Three.Mesh(new Three.SphereGeometry(20, 15, 15), matRobot);
    rotula.position.y = 120;

    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);


    base.add(brazo);
    robot.add(base);
    scene.add(robot);
    scene.add(new Three.AxesHelper(3));
}

function render() {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}