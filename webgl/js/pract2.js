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
    console.log('Hola10');
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    scene.background = new Three.Color(0.5, 0.5, 0.5);

    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, 150, 150);
    camera.lookAt(0,50,0);
}

function loadScene() {
    const matRobot = new Three.MeshBasicMaterial({ color: 'red', wireframe: true });
    const matSuelo = new Three.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    const matPinza = new Three.MeshBasicMaterial({ color: 'blue', wireframe: true});

    //suelo
    const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 20, 20), matSuelo);
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

    //Antebrazo:

    const antebrazo = new Three.Object3D();

    const disco = new Three.Mesh(new Three.CylinderGeometry(22, 22, 6, 5, 5), matRobot);
    const nervios = new Three.Object3D();

    const nervio1 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio1.position.x = 5;
    nervio1.position.z = 5;
    const nervio2 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio2.position.x = -5;
    nervio2.position.z = 5;
    const nervio3 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio3.position.x = 5;
    nervio3.position.z = -5;
    const nervio4 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio4.position.x = -5;
    nervio4.position.z = -5;

    nervios.add(nervio1);
    nervios.add(nervio2);
    nervios.add(nervio3);
    nervios.add(nervio4);
    nervios.position.y = 43;

    //Mano:

    const mano = new Three.Object3D();
    const palma = new Three.Mesh(new Three.CylinderGeometry(15, 15, 40, 10, 5), matRobot);
    palma.rotation.x = Math.PI/2;

    const pinza1 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matPinza);
    const pinza2 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matPinza);
    pinza1.position.z = -10;
    pinza2.position.z = 10;



    mano.add(palma);
    mano.add(pinza1);
    mano.add(pinza2);
    mano.position.y = 80;

    antebrazo.add(disco);
    antebrazo.add(nervios);
    antebrazo.add(mano);

    antebrazo.position.y = 120;

    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);


    base.add(brazo);
    robot.add(base);
    scene.add(robot);

    scene.add(new Three.AxesHelper(20));
}

function render() {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}