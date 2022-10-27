/** Robot para la práctica 5 */

import * as Three from "../lib/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js";
import { TWEEN } from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";

let renderer, scene, camera;
let planta;

// Variables globales
let robot, cameraControls, L=100, normals = [];
//Partes del robot:
let base, brazo, eje, nervios, esparrago, rotula, posDedo1, posDedo2, pinza1, pinza2, mano, palma, antebrazo, disco, matRobot, dedo1, dedo2;
//Materiales y sombras:
let matAntebrazo, matBrazo, matPinza, matRotula, matSuelo, matEntorno;
let ambientLight, directLight, spotLight;

//Acciones
init();
loadScene();
setupGUI();
render();


function init(){
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    
    scene = new Three.Scene();
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    let ar = window.innerWidth / window.innerHeight;

    camera = new Three.PerspectiveCamera(75, ar, 0.1, 10000);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    
    //Camara lateral --> 
    camera.position.set(50, 90, 200);
    camera.lookAt(0,100,0);
    setTopCamera(ar);
    loadLights();

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene() {
    matRobot = new Three.MeshNormalMaterial({wireframe: false});
    loadMaterials();

    //suelo
    const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 10, 10), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);
    suelo.position.y = -0.2;
    suelo.recieveShadow = true;

    //Partes del robot:
    robot = new Three.Object3D();
    robot.position.x = 0;
    robot.position.y = 1;

    //Base del robot:
    base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 20, 10), matAntebrazo);
    base.castShadow = base.receiveShadow = true;

    // Brazo:
    
    brazo = new Three.Object3D();
    
    eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matAntebrazo);
    eje.rotation.x = Math.PI/2;
    eje.castShadow = eje.receiveShadow = true;

    esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matAntebrazo);
    esparrago.position.y = 60;
    esparrago.castShadow = esparrago.receiveShadow = true;

    rotula = new Three.Mesh(new Three.SphereGeometry(20, 10, 10), matRotula);
    rotula.position.y = 120;
    rotula.castShadow = rotula.receiveShadow = true;

    //Antebrazo:

    antebrazo = new Three.Object3D();
    
    disco = new Three.Mesh(new Three.CylinderGeometry(22, 22, 6, 10, 10), matBrazo);
    disco.castShadow = disco.receiveShadow = true;

    nervios = new Three.Object3D();

    const nervio1 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matBrazo);
    nervio1.position.x = 5;
    nervio1.position.z = 5;
    nervio1.castShadow = nervio1.receiveShadow = true;

    const nervio2 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matBrazo);
    nervio2.position.x = -5;
    nervio2.position.z = 5;
    nervio2.castShadow = nervio2.receiveShadow = true;

    const nervio3 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matBrazo);
    nervio3.position.x = 5;
    nervio3.position.z = -5;
    nervio3.castShadow = nervio3.receiveShadow = true;

    const nervio4 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matBrazo);
    nervio4.position.x = -5;
    nervio4.position.z = -5;
    nervio4.castShadow = nervio4.receiveShadow = true;

    
    nervios.add(nervio1);
    nervios.add(nervio2);
    nervios.add(nervio3);
    nervios.add(nervio4);
    nervios.position.y = 43;
    nervios.castShadow = nervios.receiveShadow = true;

    
    //Mano:

    mano = new Three.Object3D();
    palma = new Three.Mesh(new Three.CylinderGeometry(15, 15, 40, 10, 5), matBrazo);
    palma.rotation.x = Math.PI/2;
    palma.castShadow = palma.receiveShadow = true;


    pinza1 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza2 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza1.position.z = -10;
    pinza2.position.z = 10;
    pinza1.position.x = 14;
    pinza2.position.x = 14;
    pinza1.castShadow = pinza1.receiveShadow = true;
    pinza2.castShadow = pinza2.receiveShadow = true;

    
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
    posDedo1 = dedo1.position.z;
    posDedo2 = dedo2.position.z;


    mano.add(palma);
    mano.add(pinza1);
    mano.add(pinza2);
    mano.add(dedo1);
    mano.add(dedo2);
    mano.position.y = 80;
    mano.castShadow = true;
    mano.receiveShadow = true;

    antebrazo.add(disco);
    antebrazo.add(nervios);
    antebrazo.add(mano);

    antebrazo.position.y = 120;
    antebrazo.castShadow = true;
    antebrazo.receiveShadow = true;

    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);

    brazo.castShadow = true;
    brazo.receiveShadow = true;

    base.add(brazo);
    robot.add(base);
    robot.castShadow = true;
    robot.receiveShadow = true;
    scene.add(robot);

    // scene.traverse(obj =>{
    //     if(obj.isObject3D) {
    //         obj.castShadow = true;
    //         obj.receiveShadow = true;
    //     }
    // })

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
        Alambres: false,
        Animate: function(){
            new TWEEN.Tween(base.rotation)
                .to({ x: 0, y: [70* Math.PI / 180, -110* Math.PI / 180, 0], z: 0}, 4000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .start();
            new TWEEN.Tween(brazo.rotation)
                .to({ x: 0, y: 0, z: [50* Math.PI / 180, -40* Math.PI / 180, 0]}, 8000)
                .interpolation(TWEEN.Interpolation.Linear)
                .start();
            new TWEEN.Tween(antebrazo.rotation)
                .to({ x: 0, y: [30* Math.PI / 180, -30* Math.PI / 180, 0], z: 0}, 4000)
                .interpolation(TWEEN.Interpolation.Linear)
                .start();

            new TWEEN.Tween(antebrazo.rotation)
                .to({ x: 0, y: 0, z: [-60* Math.PI / 180, 60* Math.PI / 180, 0]}, 9000)
                .interpolation(TWEEN.Interpolation.Linear)
                .start();
            new TWEEN.Tween(mano.rotation)
                .to({ x: 0, y: 0, z: [-20* Math.PI / 180, 180* Math.PI / 180, 0]}, 9000)
                .interpolation(TWEEN.Interpolation.Linear)
                .start();
        }
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
            dedo1.position.z = posDedo1 - value + 10;
            dedo2.position.z = posDedo2 + value - 10;
        });
    gui.add(myGUI, 'Alambres').name('Alambres')
        .onChange(value => base.material.setValues({wireframe: value}));
    gui.add(myGUI, 'Animate').name('Animacion');



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

function loadLights(){
    ambientLight = new Three.AmbientLight(0x000000);
    scene.add(ambientLight);

    let ratio = 200;
    directLight = new Three.DirectionalLight('white', 0.9);
    directLight.shadowCameraLeft = -ratio;
    directLight.shadowCameraRight = ratio;
    directLight.shadowCameraTop = ratio;
    directLight.position.set(-100,100,-100);
    directLight.shadowCameraFar = 800;
    directLight.castShadow = true;
    scene.add(directLight);


    spotLight = new Three.SpotLight('white', 0.9);
    spotLight.position.set(-400, 200, 450);
    spotLight.target.position.set(0, 100, 0);
    spotLight.angle = Math.PI / 7;
    spotLight.penumbra = 0.3;
    scene.add(spotLight.target);
    spotLight.castShadow = true;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 80;
    scene.add(spotLight);
    // scene.add(new Three.CameraHelper(spotLight.shadow.camera));
}

function loadMaterials(){
    const path = '../images/'
    const floorTexture = new Three.TextureLoader().load(path + 'pisometalico_1024.jpg');
    floorTexture.repeat.set(4,4);
    floorTexture.wrapS = floorTexture.wrapT = Three.RepeatWrapping;
    const metalTexture = new Three.TextureLoader().load(path + 'metal_128.jpg');
    const GoldTexture = new Three.TextureLoader().load(path + 'gold.jpg');
    
    const walls = [];
    const posNames = ["posx.jpg", "negx.jpg",
                      "posy.jpg", "negy.jpg",
                      "posz.jpg", "negz.jpg"];

         
    for(let i = 0;i<posNames.length;i++){
        walls.push(new Three.MeshBasicMaterial ({ side: Three.BackSide, map: new Three.TextureLoader().load(path+posNames[i])}));
    }

    const box = [ path + "posx.jpg", path+"negx.jpg",
    path + "posy.jpg", path+"negy.jpg",
    path + "posz.jpg", path+"negz.jpg",
    ]

    const ambientTexture = new Three.CubeTextureLoader().load(box);

    const room = new Three.Mesh( new Three.BoxGeometry(1000,1000,1000), walls);
    room.position.y = 400;
    scene.add(room);


    //matAntebrazo = new Three.MeshNormalMaterial({wireframe: false, flatShading: true});
    matEntorno = new Three.MeshLambertMaterial({color:'white',wireframe: false});
    matAntebrazo = new Three.MeshLambertMaterial({color:'grey', map: metalTexture});

    matRotula = new Three.MeshPhongMaterial({color:'white', specular: 'white', shininess: 30, envMap: ambientTexture});                                  
    matBrazo = new Three.MeshPhongMaterial({color:'white', specular: 'black', shininess: 2, map: GoldTexture});
    matSuelo = new Three.MeshStandardMaterial({color:'white', wireframe: false, map: floorTexture});
    matPinza = new Three.MeshPhongMaterial({color:'#161c20', wireframe: false});
}