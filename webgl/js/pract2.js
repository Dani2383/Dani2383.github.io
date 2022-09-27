/** Robot para la práctica 2 */

import * as Three from "../lib/three.module.js";

let renderer, scene, camera;

// Variables globales
let robot, angulo;
//Acciones
init();
loadScene();
render();

function init(){
    renderer = new Three.WebGLRenderer();
    console.log('Hola6');
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    scene.background = new Three.Color(0.5, 0.5, 0.5);

    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    //Camara lateral --> 
    // camera.position.set(0, 150, 200);
    // camera.lookAt(0,150,0);

    // Camara planta --> 
    // camera.position.set(0, 250, 0);
    // camera.lookAt(0,0,0);

    //Camara frontal --> 
    camera.position.set(150, 200, 0);
    camera.lookAt(0,200,0);

    // Camara inferior --> 
    //  camera.position.set(13, 150, 0);
    //  camera.lookAt(13,200,0);
}

function loadScene() {
    const matRobot = new Three.MeshBasicMaterial({ color: 'red', wireframe: true });
    const matSuelo = new Three.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    const matPinza = new Three.MeshBasicMaterial({ color: 'blue', wireframe: true});

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
    const base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 10, 10), matRobot);

    // Brazo:

    const brazo = new Three.Object3D();

    const eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matRobot);
    eje.rotation.x = Math.PI/2;

    const esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matRobot);
    esparrago.position.y = 60;

    const rotula = new Three.Mesh(new Three.SphereGeometry(20, 5, 5), matRobot);
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
    pinza1.position.x = 14;
    pinza2.position.x = 14;

    //Malla personalizada:

    const malla = new Three.BufferGeometry();
    const coord = [23,10,12, 23,10,8, 42,6,8, 42,6,10,
                    23,-10,8, 23,-10,12, 42,-6,10, 42,-6,8];
    const colors = [1,0,0, 1,0,1, 1,1,1, 1,1,0,
                    0,1,0, 0,1,1, 0,0,1, 0,0,0];
    const indices = [1,0,3, 1,3,2, 0,1,5, 1,4,5,
                    5,4,7, 6,5,7, 2,3,6, 2,6,7,
                    1,2,4, 2,7,4, 0,5,3, 3,5,6];
    malla.setIndex(indices);
    malla.setAttribute( 'position', new Three.Float32BufferAttribute(coord, 3));
    malla.setAttribute( 'color', new Three.Float32BufferAttribute(colors, 3));
    const matDedos = new Three.MeshBasicMaterial({vertexColors: true});
    const dedo2 = new Three.Mesh(malla, matDedos);


    mano.add(palma);
    mano.add(pinza1);
    mano.add(pinza2);
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

    scene.add(new Three.AxesHelper(20));
}

function render() {
    requestAnimationFrame( render );
    update();
    renderer.render(scene, camera);
}

function update() {
    angulo += 0.01;
    robot.rotation.y = angulo;
}