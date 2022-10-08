/** Robot para la práctica 3 */

import * as Three from "../lib/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js";
import { TWEEN as Tween} from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";
import Stats from "../lib/stats.module.js";

let renderer, scene, camera;
let planta;

// Variables globales
let robot, cameraControls, L=100, normals = [];
//Partes del robot:
let base, brazo, eje, nervios, esparrago, rotula, pinzaPosBase, pinza1, pinza2, mano, palma, antebrazo, disco, matRobot, dedo1, dedo2;
//Acciones
init();
loadScene();
setupGUI();
render();


function init(){
    console.log('Controles POSICION BIEN');
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    
    scene = new Three.Scene();
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    let ar = window.innerWidth / window.innerHeight;

    camera = new Three.PerspectiveCamera(75, ar, 0.1, 1000);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    
    //Camara lateral --> 
    camera.position.set(50, 90, 200);
    camera.lookAt(0,100,0);
    setTopCamera(ar);

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene() {
    matRobot = new Three.MeshNormalMaterial({wireframe: false});
    const matSuelo = new Three.MeshNormalMaterial();

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
    base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 20, 10), matRobot);

    // Brazo:
    
    brazo = new Three.Object3D();
    
    eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matRobot);
    eje.rotation.x = Math.PI/2;

    esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matRobot);
    esparrago.position.y = 60;

    rotula = new Three.Mesh(new Three.SphereGeometry(20, 10, 10), matRobot);
    rotula.position.y = 120;

    //Antebrazo:

    antebrazo = new Three.Object3D();
    
    disco = new Three.Mesh(new Three.CylinderGeometry(22, 22, 6, 10, 10), matRobot);
    nervios = new Three.Object3D();

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

    mano = new Three.Object3D();
    palma = new Three.Mesh(new Three.CylinderGeometry(15, 15, 40, 10, 5), matRobot);
    palma.rotation.x = Math.PI/2;

    pinza1 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza2 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza1.position.z = -10;
    pinzaPosBase = 10
    pinza2.position.z = 10;
    pinza1.position.x = 14;
    pinza2.position.x = 14;
    
    //Malla personalizada:
    
    const malla = new Three.BufferGeometry();
    
    const coord = [

        23,10,12, 23,10,8, 42,6,8, 42,6,10, // Arriba  0-3
        23,10,12, 23,10,8, 23,-10,8, 23,-10,12, // Detras 4-7
        23,-10,8, 23,-10,12, 42,-6,10, 42,-6,8, // Debajo 8 - 11
        42,6,8, 42,6,10, 42,-6,10, 42,-6,8, // Delante 12-15
        23,10,8, 42,6,8, 23,-10,8, 42,-6,8, // Izquierda 16-19

        23,10,12, 42,6,10, 23,-10,12, 42,-6,10 // Derecha 20-23

    ]

    malla.setAttribute( 'position', new Three.Float32BufferAttribute(coord, 3));
    let vectorPositions = [];

    for(let i = 0;i < coord.length / 3; i++){
        const v = new Three.Vector3( );
        v.fromBufferAttribute(malla.getAttribute('position'),i)
        vectorPositions.push(v)
    }

    getNormalVector(vectorPositions[3], vectorPositions[1], vectorPositions[0]); getNormalVector(vectorPositions[0], vectorPositions[2], vectorPositions[1]); // Arriba
    getNormalVector(vectorPositions[1], vectorPositions[3], vectorPositions[2]); getNormalVector(vectorPositions[2], vectorPositions[0], vectorPositions[3]); // Arriba

    getNormalVector(vectorPositions[5], vectorPositions[7], vectorPositions[4]); getNormalVector(vectorPositions[6], vectorPositions[4], vectorPositions[5]); // Detras
    getNormalVector(vectorPositions[7], vectorPositions[5], vectorPositions[6]); getNormalVector(vectorPositions[4], vectorPositions[6], vectorPositions[7]); // Detras

    getNormalVector(vectorPositions[11], vectorPositions[9], vectorPositions[8]); getNormalVector(vectorPositions[8], vectorPositions[10], vectorPositions[9]); // Debajo
    getNormalVector(vectorPositions[9], vectorPositions[11], vectorPositions[10]); getNormalVector(vectorPositions[10], vectorPositions[8], vectorPositions[11]); // Debajo

    getNormalVector(vectorPositions[13], vectorPositions[15], vectorPositions[12]); getNormalVector(vectorPositions[14], vectorPositions[12], vectorPositions[13]); // Delante
    getNormalVector(vectorPositions[15], vectorPositions[13], vectorPositions[14]); getNormalVector(vectorPositions[12], vectorPositions[14], vectorPositions[15]); // Delante

    getNormalVector(vectorPositions[17], vectorPositions[18], vectorPositions[16]); getNormalVector(vectorPositions[19], vectorPositions[16], vectorPositions[17]); // Izquierda
    getNormalVector(vectorPositions[16], vectorPositions[19], vectorPositions[18]); getNormalVector(vectorPositions[18], vectorPositions[17], vectorPositions[19]); // Izquierda

    getNormalVector(vectorPositions[22], vectorPositions[21], vectorPositions[20]); getNormalVector(vectorPositions[20], vectorPositions[23], vectorPositions[21]); // Derecha
    getNormalVector(vectorPositions[23], vectorPositions[20], vectorPositions[22]); getNormalVector(vectorPositions[21], vectorPositions[22], vectorPositions[23]); // Derecha

    const indices = [1,0,3, 1,3,2, 4,5,7, 5,6,7, // Top, Back
                    9,8,11, 10,9,11, 12,13,14, 12,14,15, // Bot, Front
                    16,17,18, 17,19,18, 20,22,21, 21,22,23]; // Left, Right

    malla.setIndex(indices);
    malla.setAttribute( 'normal', new Three.Float32BufferAttribute(normals, 3));
    dedo1 = new Three.Mesh(malla, matRobot);
    dedo2 = new Three.Mesh(malla, matRobot);
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
    renderer.clear();
    
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);

    let side = window.innerWidth > window.innerHeight ? 1/4 * window.innerHeight : 1/4 * window.innerWidth;
    renderer.setViewport(0, window.innerHeight-side, side, side);
    renderer.render(scene, planta);
}

function updateAspectRatio()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    let ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    planta.aspect = 1;
    if (ar > 1) {
        planta.left = -1/4*window.innerHeight;
        planta.right = 1/4*window.innerHeight;
        planta.top = 1/4*window.innerHeight;
        planta.bottom = -1/4*window.innerHeight;
    } else {
        planta.left = -1/4*window.innerWidth;
        planta.right = 1/4*window.innerWidth;
        planta.top = 1/4*window.innerWidth;
        planta.bottom = -1/4*window.innerWidth;
    }

    planta.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}

function setupGUI(){
    const gui = new GUI();
    const myGUI = {
        GiroBase: 0,
        GiroBrazo: 0,
        GiroAntebrazoY: 0,
        GiroAntebrazoZ: 0,
        GiroPinza: 0,
        SeparacionPinza: 10,
        Alambres: false
    }

    gui.add(myGUI, 'GiroBase', -180, 180).name('Giro Base')
        .onChange(value => base.rotation.y = value * Math.PI / 180);
    gui.add(myGUI, 'GiroBrazo', -45, 45).name('Giro Brazo')
        .onChange(value => brazo.rotation.z = value * Math.PI / 180);
    gui.add(myGUI, 'GiroAntebrazoY', -180, 180).name('Giro Antebrazo en Y')
        .onChange(value => antebrazo.rotation.y = value * Math.PI / 180);
    gui.add(myGUI, 'GiroAntebrazoZ', -90, 90).name('Giro antebrazo en Z')
        .onChange(value => antebrazo.rotation.z = value * Math.PI / 180);
    gui.add(myGUI, 'GiroPinza', -40, 220).name('Giro Pinza')
        .onChange(value => mano.rotation.z = value * Math.PI / 180);
    gui.add(myGUI, 'SeparacionPinza', 0, 15).name('Separación Pinza')
        .onChange(value => {
            pinza1.position.z = - value;
            pinza2.position.z = value;
            dedo1.position.z = - value;
            dedo2.position.z = value;
        });
    gui.add(myGUI, 'Alambres').name('Alambres')
        .onChange(value => matRobot = new Three.MeshNormalMaterial({wireframe: value}));



}

function setTopCamera(ar){
    let camaraOrtografica;
    if (ar > 1) camaraOrtografica = new Three.OrthographicCamera(-1/4*window.innerHeight, 1/4*window.innerHeight, 1/4*window.innerHeight, -1/4*window.innerHeight, -10, 10000);
    else camaraOrtografica = new Three.OrthographicCamera(-1/4*window.innerWidth, 1/4*window.innerWidth, 1/4*window.innerWidth, -1/4*window.innerWidth, -10, 10000);

    planta = camaraOrtografica.clone();
    planta.position.set(0,L*3,0);
    planta.lookAt(0,0,0);
    planta.up = new Three.Vector3(0,0,-1);

}

function getNormalVector(pos1, pos2, posNormal){
    const normal = new Three.Vector3();
    const x = new Three.Vector3();
    const y = new Three.Vector3();
    x.subVectors(pos1, posNormal);
    y.subVectors(pos2, posNormal);
    normal.crossVectors(x, y);
    normals.push(normal.x, normal.y, normal.z);
}