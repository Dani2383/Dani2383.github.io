import * as Three from "../lib/three.module.js";
import { FirstPersonControls } from '../lib/FirstPersonControls.js';
import { TWEEN } from "../lib/tween.module.min.js";

//variables globales
  let renderer;
  let scene; 
  let gameEnded = false;


//Tiempo --> 
  let former = Date.now();
  let deltaTime;
  let timeLimit = 5000;
  let remainingTime = 5000;

//Escenario -->
  let walls = [];
  let wallColliders = [];
  let column;
  let columns = [];
  let columnColliders = [];
  let columnNum = 0;

//Puntuación --> 
  let objective;
  let objectives = [];
  let objectiveColliders = [];
  let objectiveAnimations = [];
  let objectiveNum;
  let score;
  let formerScore = 0;
  let deltaScore;

//Movimiento -->
  let yawObject;
  let camera;
  let cameraBB;  
  let keyboard; 
  let keysPressed = [false, false, false, false]; // W, A, S, D
  let cameraController;

//Materiales -->
  let floorMat;
  let columnMat;
  let wallMat;
  let objectiveMat;
  let skyTexture;

//Sonido -->
  let listener;
  let shotSound;
  let scoreSound;
  let endGameSound;

init();
loadScene();
render();

function init(){
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    keyboard = new THREEx.KeyboardState(document.body);
    scene = new Three.Scene();
    renderer.autoClear = false;
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    let ar = window.innerWidth / window.innerHeight;
    score = 0;

    //Camara -->
    camera = new Three.PerspectiveCamera(75, ar, 0.1, 100000);
    cameraBB = new Three.Sphere(camera.position, 5);

    let reticle = new Three.Mesh(
        new Three.RingGeometry( 0.4, 0.45, 32),
        new Three.MeshBasicMaterial( {color: 0xffffff, blending: Three.AdditiveBlending, side: Three.DoubleSide })
    );

    reticle.position.z = -30;
    camera.add(reticle);


    cameraControls();    

    window.addEventListener('resize', updateAspectRatio );

    //Inputs por teclado --> 
    renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();
	
	keyboard.domElement.addEventListener('keydown', function(event){
        if(keyboard.eventMatches(event, 'w') && cameraController.enabled){
            keysPressed[0] = true;
        }
        if(keyboard.eventMatches(event, 'a') && cameraController.enabled){
            keysPressed[1] = true;
        }
        if(keyboard.eventMatches(event, 's') && cameraController.enabled){
            keysPressed[2] = true;
        }
        if(keyboard.eventMatches(event, 'd') && cameraController.enabled){
            keysPressed[3] = true;
        }
    })

    keyboard.domElement.addEventListener('keyup', function(event){
        if(keyboard.eventMatches(event, 'w')){
            keysPressed[0] = false;
        }
        if(keyboard.eventMatches(event, 'a')){
            keysPressed[1] = false;
        }
        if(keyboard.eventMatches(event, 's')){
            keysPressed[2] = false;
        }
        if(keyboard.eventMatches(event, 'd')){
            keysPressed[3] = false;
        }
    })

    loadLights();
    
    //Sonidos --> 
    listener = new Three.AudioListener();
    camera.add(listener);

    shotSound = new Three.Audio(listener);
    scoreSound = new Three.Audio(listener);
    endGameSound = new Three.Audio(listener);

    loadAudios();
    
}

function loadScene(){

    loadMaterials();

    // Ponemos el cielo -->
    scene.background = skyTexture;
    const skyBoxSphere = new Three.Mesh( new Three.SphereGeometry(6000,20,20), skyTexture );
    scene.add(skyBoxSphere);

    // Suelo --> 
    const floor = new Three.Mesh( new Three.PlaneGeometry(10000, 10000, 10, 10), floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -0.2;
    scene.add(floor);

    //Paredes externas
    const wall_1 = new Three.Mesh( new Three.BoxGeometry(9000, 1000, 40), wallMat );
    wall_1.position.z = 4500;
    wall_1.position.y = 500;
    const wall_1BB = new Three.Box3().setFromObject(wall_1);

    const wall_2 = new Three.Mesh( new Three.BoxGeometry(9000, 1000, 40), wallMat );
    wall_2.position.z = -4500;
    wall_2.position.y = 500;
    const wall_2BB = new Three.Box3().setFromObject(wall_2);

    const wall_3 = new Three.Mesh( new Three.BoxGeometry(9000, 1000, 40), wallMat );
    wall_3.position.x = 4500;
    wall_3.position.y = 500;
    wall_3.rotation.y = - Math.PI/2;
    const wall_3BB = new Three.Box3().setFromObject(wall_3);

    const wall_4 = new Three.Mesh( new Three.BoxGeometry(9000, 1000, 40), wallMat );
    wall_4.position.x = -4500;
    wall_4.position.y = 500;
    wall_4.rotation.y = - Math.PI/2;
    const wall_4BB = new Three.Box3().setFromObject(wall_4);    

    //Paredes centrales colocadas de forma aleatoria -->
    column = new Three.Mesh( new Three.BoxGeometry(200, 1000, 200), columnMat);
    columnNum = 0;
    generateColumns();
    
    //Objetivos puestos de forma aleatoria, apareceran mas conforme se destruyan -->
    objective = new Three.Mesh( new Three.BoxGeometry(50, 50, 50), objectiveMat);
    objectiveNum = 0;
    generateObjectives();

    scene.add(wall_1);
    scene.add(wall_2);
    scene.add(wall_3);
    scene.add(wall_4);

    walls = [wall_1, wall_2, wall_3, wall_4];
    wallColliders = [wall_1BB, wall_2BB, wall_3BB, wall_4BB];
    
}

function render() {
    requestAnimationFrame( render );
    renderer.clear();
    
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
    updateTime();

    if(remainingTime <= 0) endGame();

    cameraController.update();
    TWEEN.update();
}

function endGame(){
    // Reempieza todo
    endGameSound.play();
    gameEnded = true;
    cameraController.enabled = false;
    remainingTime = timeLimit;
    score = 0;
    yawObject.position.set(0,70,0);
    former = Date.now();
    columnNum = 0;
    objectiveNum = 0;
    formerScore = 0;
    columns.forEach(column => scene.remove(column));
    objectives.forEach(objective => scene.remove(objective));
    objectives = [];
    objectiveColliders = [];
    columns = [];
    columnColliders = [];
    document.getElementById("endGame").innerText = "¡Fin de partida!";
    generateColumns();
    generateObjectives();
}

// Funciones auxiliares --> 


function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    let ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
   
    camera.updateProjectionMatrix();
    cameraController.handleResize();
}

//Actualiza el contador de tiempo -->
function updateTime(){
    if(!cameraController.enabled) {
        let current = Date.now();
        former = current;
        return;
    }
    let current = Date.now();
    deltaTime = (current - former);
    former = current;

    let currentScore = score;
    deltaScore = (currentScore - formerScore);
    formerScore = currentScore

    remainingTime -= deltaTime;
    remainingTime += 2000 * deltaScore;

    remainingTime = Math.min(remainingTime, timeLimit);

    document.querySelector('#remainingTime').innerText = "" + parseInt((remainingTime / 1000) + 1);
    document.querySelector('#score').innerText = "" + score;

}

// Funcionalidades de la camara en primera persona --> 
function cameraControls(){

    cameraController = new FirstPersonControls(camera, renderer.domElement);
    cameraController.speed = 8000;
    cameraController.MouseMoveSensitivity = 0.002;
	cameraController.jumpHeight = cameraController.height + 350;

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mousedown', onMouseDownClick, false );

    
    let velocity = new Three.Vector3();
	let direction = new Three.Vector3();
    
	let prevTime = Date.now();
    
	camera.rotation.set( 0, 0, 0 );
    
	let pitchObject = new Three.Object3D();
	pitchObject.add( camera );
    
	yawObject = new Three.Object3D();
	yawObject.position.y = 70;
	yawObject.add( pitchObject );
    
    scene.add(yawObject);
	function onMouseMove(event) {
        
        if( !cameraController.enabled ) return;

        let movementX = event.movementX || 0;
        let movementY = event.movementY || 0;
  
        yawObject.rotation.y -= movementX * cameraController.MouseMoveSensitivity;
        pitchObject.rotation.x -= movementY * cameraController.MouseMoveSensitivity;
    
        pitchObject.rotation.x = Math.max( -  Math.PI / 2, Math.min(  Math.PI / 2, pitchObject.rotation.x ) );
  
	}

    cameraController.enabled = false;
    cameraController.update = function () {
        if(!cameraController.enabled){
            let time = Date.now();
            prevTime = time;
            velocity.x = 0;
            velocity.z = 0;
            return;
        }
        let time = Date.now();
        let delta = ( time - prevTime ) / 1000;
    
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
    
        direction.z = Number( keysPressed[0] ) - Number( keysPressed[2] );
        direction.x = Number( keysPressed[3] ) - Number( keysPressed[1] );
        direction.normalize();

        cameraBB = new Three.Sphere(yawObject.position, 5);
        checkCollision(cameraBB, wallColliders, columnColliders);
    
        let currentSpeed = cameraController.speed;
    
        if ( keysPressed[0] || keysPressed[2] ) velocity.z -= direction.z * currentSpeed * delta;
 
        if ( keysPressed[1] || keysPressed[3] ) velocity.x -= direction.x * currentSpeed * delta;

        yawObject.translateX( -velocity.x * delta );
        yawObject.translateZ( velocity.z * delta );
        
        prevTime = time;
    }

    function onMouseDownClick(event){
        if( !cameraController.enabled ){
            if(gameEnded) {
                cameraController.enabled = true;
                document.getElementById("endGame").innerText = "";
                gameEnded = false;
            }
            return;
        }
        shoot(event);
    }

    cursorLocker();

   
}

// Funcion obtenida de un usuario de codepen para fijar y desfijar el cursor -->
function cursorLocker(){
    let instructions = document.querySelector("#instructions");
    let controls = document.querySelector("#controls");

    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
        let element = document.body;
        let pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            cameraController.enabled = true;
            instructions.style.display = 'none';
            controls.style.display = 'none';

        } else {
            cameraController.enabled = false;
            keysPressed = [false, false, false, false, false];
            instructions.style.display = '-webkit-box';
            controls.style.display = '-webkit-box';

        }
        };
        let pointerlockerror = function ( event ) {
            instructions.style.display = 'none';
            controls.style.display = 'none';

        };
    
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    
        instructions.addEventListener( 'click', function ( event ) {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ) {
            let fullscreenchange = function ( event ) {
            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                element.requestPointerLock();
            }
            };
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();
        } else {
            element.requestPointerLock();
        }
        }, false );
    } else {
        instructions.innerHTML = 'Your browser not suported PointerLock';
    }
}

//Comprueba si el jugador choca con una pared o columna -->
function checkCollision(cameraBB, wallColliders, columnColliders){
    wallColliders.forEach(collider => {
        if(cameraBB.intersectsBox(collider)){
            endGame();
        }
    })
    columnColliders.forEach(collider => {
        if(cameraBB.intersectsBox(collider)){
            endGame();
        }
    })
}

//Dispara a la posición dada por el ratón en pantalla -->
function shoot(event){
    shotSound.play();
    let shootX = event.clientX;
    let shootY = event.clientY;
    shootX = ( shootX / window.innerWidth ) * 2 - 1;
    shootY = -( shootY / window.innerHeight ) * 2 + 1;
    let colRay = new Three.Raycaster();
    colRay.set(camera.getWorldPosition(new Three.Vector3()), camera.getWorldDirection(new Three.Vector3()));
    let auxArray = [];
    for(let i = 0; i < objectives.length; i++){
        auxArray = columns.concat(objectives[i]);
        let intersection = colRay.intersectObjects(auxArray, false);
        if(intersection.length > 0) {
            if(intersection[0].object.uuid == objectives[i].uuid){
                let auxObjective = objectives[i];
                objectives.splice(i, 1);
                objectiveColliders.splice(i, 1);
                objectiveNum--;
                score += 1;
                scoreSound.play();
                shrinkAnimation(auxObjective, i);
            }
        }
    }
    if(objectiveNum < 20) generateObjectives();
}

//Comprueba que el objeto nuevo se pueda colocar en la posición dada de forma aleatoria -->
function checkAvailability(colliderAux, columnColliders, objectives = false, objectiveColliders = []){
    let error = 0
    columnColliders.forEach(collider => {
        if(colliderAux.intersectsBox(collider)) error += 1;
    })

    if(objectives){
        objectiveColliders.forEach(collider => {
            if(colliderAux.intersectsBox(collider)) error += 1;
        })
    }
    if (error > 0) return false;
    else return true;
}

//Anima al objetivo en cuestion --> 
function startAnimation(objective){
    let animation = new TWEEN.Tween(objective.rotation)
        .to({x:[Math.PI,-Math.PI/2,0],y:[Math.PI,-Math.PI/2,0],z:[Math.PI,-Math.PI/2,0]}, 3000 + Math.random() * 1000 )
        .interpolation(TWEEN.Interpolation.Linear)
        .repeat(Infinity)
        .start();
    objectiveAnimations.push(animation);
}

//Da la animacion de destruccion del objetivo
function shrinkAnimation(auxObjective, objectiveIndex){
    objectiveAnimations.splice(objectiveIndex, 1);
    new TWEEN.Tween(auxObjective.scale)
        .to({x:0, y:0, z:0}, 1000)
        .interpolation(TWEEN.Interpolation.Linear)
        .start()
        .onComplete(function(){
            scene.remove(auxObjective);
        })
    

}

function generateObjectives(){
    while(objectiveNum < 30){
        let objectiveAux = objective.clone();
        objectiveAux.position.x = Math.random() < 0.5 ? Math.random() * -4250 : Math.random() * 4250;
        objectiveAux.position.z = Math.random() < 0.5 ? Math.random() * -4250 : Math.random() * 4250;
        objectiveAux.position.y = 50 + Math.random() * 500;
        let objectiveColliderAux = new Three.Box3().setFromObject(objectiveAux);
        scene.add(objectiveAux);

        if(checkAvailability(objectiveColliderAux, columnColliders, true, objectiveColliders)){
            objectives.push(objectiveAux);
            objectiveColliders.push(objectiveColliderAux);
            objectiveNum +=1;
            startAnimation(objectiveAux);
        }
        else scene.remove(objectiveAux);
    }
}

function generateColumns(){
    while(columnNum < 150){
        let columnAux = column.clone();
        columnAux.position.x = Math.random() < 0.5 ? Math.random() * -4250 : Math.random() * 4250;
        columnAux.position.z = Math.random() < 0.5 ? Math.random() * -4250 : Math.random() * 4250;
        columnAux.position.y = 500;
        let columnColliderAux = new Three.Box3().setFromObject(columnAux);
        scene.add(columnAux);

        if(checkAvailability(columnColliderAux, columnColliders)){
            columns.push(columnAux);
            columnColliders.push(columnColliderAux);
            columnNum +=1;
        }
        else scene.remove(columnAux);
    }
}

function loadLights(){
    const ambiental = new Three.AmbientLight(0x222222, 1);
    scene.add(ambiental);

    const direccional1 = new Three.DirectionalLight(0xFFFFFF,0.5);
    direccional1.position.set(3000,2000,3000);

    const direccional2 = new Three.DirectionalLight(0xFFFFFF,0.5);
    direccional2.position.set(-3000,2000,-3000);

    direccional1.castShadow = true;
    direccional2.castShadow = true;

    scene.add(direccional1);
    scene.add(direccional2);

}

function loadMaterials(){
    const path = '../images/';
    const floorTexture = new Three.TextureLoader().load(path+'iron.jpg');
    const columnTexture = new Three.TextureLoader().load(path+'laser.jpg');
    const wallTexture = new Three.TextureLoader().load(path+'purpleWall.jpg');
    const objectiveTexture = new Three.TextureLoader().load(path+'slime.jpg');


    floorTexture.wrapS = floorTexture.wrapT = Three.RepeatWrapping;
    floorTexture.repeat.set(75,75);
    floorTexture.anisotropy = 16;

    floorMat = new Three.MeshStandardMaterial({color:'rgb(150,150,150)', map:floorTexture});
    columnMat = new Three.MeshStandardMaterial({color:'rgb(150,150,150)',map:columnTexture});
    columnMat.transparent = true;
    columnMat.opacity = 0.8;
    wallMat = new Three.MeshStandardMaterial({color:'rgb(150,150,150)', map:wallTexture});
    objectiveMat = new Three.MeshStandardMaterial({color:'rgb(150,150,150)', map:objectiveTexture});
    objectiveMat.transparent = false;
    objectiveMat.opacity = 0.9;

    const skyBox = [ path+"Xpos.png", path+"Xneg.png",
                      path+"Ypos.png", path+"Yneg.png",
                      path+"Zpos.png", path+"Zneg.png"];

    skyTexture = new Three.CubeTextureLoader().load(skyBox);
}

function loadAudios(){
    let audioLoader = new Three.AudioLoader();

    audioLoader.load('../audios/shotSound.mp3', function(buffer) {
        shotSound.setBuffer(buffer);
        shotSound.setVolume(0.1);
        shotSound.setLoop(false);
    })

    audioLoader.load('../audios/scoreSound.mp3', function(buffer) {
        scoreSound.setBuffer(buffer);
        scoreSound.setVolume(1);
        scoreSound.setLoop(false);
    })

    audioLoader.load('../audios/deathSound.mp3', function(buffer) {
        endGameSound.setBuffer(buffer);
        endGameSound.setVolume(0.5);
        endGameSound.setLoop(false);
    })
}