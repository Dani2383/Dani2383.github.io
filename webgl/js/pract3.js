/** Robot para la práctica 2 */

import * as Three from "../lib/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js";

let renderer, scene, camera;

// Variables globales
let robot, angulo = 0, cameraControls, L=5;
//Acciones
init();
loadScene();
render();

function setTopCamera(ar){
    let planta;
    if (ar > 1) planta = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -10, 100);
    else planta = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -10, 100);

    planta.position.set(0,L,0);
    planta.lookAt(0,0,0);
    planta.up = new THREE.Vector3(0,0,-1);

}

function init(){
    console.log("cameras");
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    scene.background = new Three.Color(0.5, 0.5, 0.5);
    renderer.autoClear = false;
    ar = window.innerWidth / window.innerHeight;

    camera = new Three.PerspectiveCamera(75, ar, 0.1, 1000);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    
    //Camara lateral --> 
    camera.position.set(50, 90, 200);
    camera.lookAt(0,100,0);
    setTopCamera(ar);

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene() {
    //const matRobot = new Three.MeshBasicMaterial({ color: 'red', wireframe: true });
    const matRobot = new Three.MeshNormalMaterial();
    const matSuelo = new Three.MeshBasicMaterial({ color: 'yellow', wireframe: true });

    //suelo
    const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 10, 10), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);
    suelo.position.y = -0.2;

    //Partes del robot:
    robot = new Three.Object3D();
    robot.position.x = 0;
    robot.position.y = 1;

    //Base del robot:
    const base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 20, 10), matRobot);

    // Brazo:

    const brazo = new Three.Object3D();

    const eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matRobot);
    eje.rotation.x = Math.PI/2;

    const esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matRobot);
    esparrago.position.y = 60;

    const rotula = new Three.Mesh(new Three.SphereGeometry(20, 10, 10), matRobot);
    rotula.position.y = 120;

    //Antebrazo:

    const antebrazo = new Three.Object3D();

    const disco = new Three.Mesh(new Three.CylinderGeometry(22, 22, 6, 10, 10), matRobot);
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

    const pinza1 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    const pinza2 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza1.position.z = -10;
    pinza2.position.z = 10;
    pinza1.position.x = 14;
    pinza2.position.x = 14;

    //Malla personalizada:

    const malla = new Three.BufferGeometry();

    const coord = [23,10,12, 23,10,8, 42,6,8, 42,6,10,
                    23,-10,8, 23,-10,12, 42,-6,10, 42,-6,8];

    const colors = [1,0,0, 1,0,1, 1,1,1, 1,1,0,
                    0,1,0, 0,1,1, 0,0,1, 0,0,0];
    
    const normals = [0,1,-2, 0,1,-2, -1,0,0, -1,0,0, // Top back
                    0,-1,-2, 0,-1,-2, 1,0,0, 1,0,0, //Bot front
                    0,0,-1, 0,0,-1, 0,0,1, 0,0,1]; //Left right

    const indices = [1,0,3, 1,3,2, 0,1,5, 1,4,5, // Top, Back
                    5,4,7, 6,5,7, 2,3,6, 2,6,7, // Bot, Front
                    1,2,4, 2,7,4, 0,5,3, 3,5,6]; // Left, Right
    malla.setIndex(indices);
    malla.setAttribute( 'position', new Three.Float32BufferAttribute(coord, 3));
    malla.setAttribute( 'color', new Three.Float32BufferAttribute(colors, 3));
    malla.setAttribute( 'normal', new Three.Float32BufferAttribute(normals, 3));
    const dedo2 = new Three.Mesh(malla, matRobot);
    const dedo1 = new Three.Mesh(malla, matRobot);
    dedo1.rotation.x = Math.PI;


    mano.add(palma);
    mano.add(pinza1);
    mano.add(pinza2);
    mano.add(dedo1);
    mano.add(dedo2);
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

}

function render() {
    requestAnimationFrame( render );
    update();
    renderer.clear();
    renderer.setViewPort(0, window.innherHeigth * 3/4, window.innerWidth / 4, window.innerHeight / 4)
    renderer.render(scene, planta);

    renderer.setViewPort(0,0,window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
}

function update() {
    angulo += 0.005;
    robot.rotation.y = angulo;
}

function updateAspectRatio()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;

    if (ar > 1) {
        planta.left = -L*ar;
        planta.right = L*ar;
        planta.top = L;
        planta.bottom = -L;
    } else {
        planta.left = -L;
        planta.right = L;
        planta.top = L/ar;
        planta.bottom = -L/ar;
    }

    planta.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}