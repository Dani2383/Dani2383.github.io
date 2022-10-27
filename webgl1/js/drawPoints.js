/* Seminario 1: Dibujar puntos con VBOs */

// Shader de vertices
const VSHADER_SOURCE = `
    attribute vec3 position;
    void main(){
        gl_Position = vec4(position, 1.0);
        gl_PointSize = 10.0;
    }
`
const FSHADER_SOURCE = `
    uniform highp vec3 color;
    void main(){
        gl_FragColor = vec4(color, 1.0);
    }    
`

const clicks = [];
let colorFragment;

function main(){
    // Recupera el lienzo
    const canvas = document.getElementById('canvas');
    const gl = getWebGLContext(canvas);

    // Cargo shaders en el programa
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('La cosa no pinta bien');
    }

    // Color de borrado del lienzo
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    // Localiza el att del shader position
    const coord = gl.getAttribLocation(gl.program, 'position');

    // Crea buffer
    const bufferVertices = gl.createBuffer();
}