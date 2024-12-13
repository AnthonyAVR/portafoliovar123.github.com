const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Escalar el contexto para mejorar la visualización
context.scale(20, 20);

// Definir la matriz de colores para las piezas
const colors = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF', // Z
];

// Definir las formas de las piezas
const matrix = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    'J': [
        [2,0,0],
        [2,2,2],
        [0,0,0],
    ],
    'L': [
        [0,0,3],
        [3,3,3],
        [0,0,0],
    ],
    'O': [
        [4,4],
        [4,4],
    ],
    'S': [
        [0,5,5],
        [5,5,0],
        [0,0,0],
    ],
    'T': [
        [0,6,0],
        [6,6,6],
        [0,0,0],
    ],
    'Z': [
        [7,7,0],
        [0,7,7],
        [0,0,0],
    ]
};

// Crear la pieza
function createPiece(type){
    return matrix[type];
}

// Dibujar la matriz en el canvas
function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Dibujar el juego
function draw(){
    context.fillStyle = '#f0f8ff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

// Fusionar la pieza con el arena
function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Limpiar líneas completas
function arenaSweep(){
    let rowCount = 1;
    outer: for(let y = arena.length -1; y > 0; --y){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 100; // Incrementar puntuación
        updateScore(); // Actualizar puntuación
        rowCount *= 2; // Incrementar el multiplicador
    }
}

// Detectar colisiones
function collide(arena, player){
    const m = player.matrix;
    const o = player.pos;
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if(m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
}

// Rotar la pieza
function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
        for(let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if(dir > 0){
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Movimiento de la pieza
function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}

// Caída de la pieza
function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
        updateScore();
    }
    dropCounter = 0;
}

// Soltar la pieza
function playerHardDrop(){
    while(!collide(arena, player)){
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
    updateScore();
    dropCounter = 0;
}

// Reiniciar la pieza
function playerReset(){
    const pieces = 'IJLOSTZ';
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    player.matrix = createPiece(randomPiece);
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length / 2) - (player.matrix[0].length / 2));

    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        alert('¡Juego Terminado!');
    }
}

// Girar la pieza
function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Crear el arena
function createMatrix(w, h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const arena = createMatrix(12, 20);

// Definir el jugador
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    level: 1,
};

// Manejar controles de teclado
document.addEventListener('keydown', event => {
    if(event.key === 'ArrowLeft'){
        playerMove(-1);
    } else if(event.key === 'ArrowRight'){
        playerMove(1);
    } else if(event.key === 'ArrowDown'){
        playerDrop();
    } else if(event.key === 'ArrowUp'){
        playerRotate(1);
    } else if(event.key === ' '){
        event.preventDefault();
        playerHardDrop();
    }
});

// Variables para controlar la pausa
let isPaused = false;

// Actualizar el juego
let dropCounter = 0;
let dropInterval = 1000; // Tiempo entre caídas
let lastTime = 0;

function update(time = 0){
    if (isPaused) {
        return; // Si el juego está pausado, no hacer nada
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    // Actualizar el tiempo de caída y el nivel
    if(dropCounter > dropInterval){
        playerDrop();
    }

    // Aumentar la dificultad del juego con niveles
    if (player.score >= player.level * 1000) { // Cada 1000 puntos se aumenta el nivel
        player.level++;
        dropInterval *= 0.9; // Aumentar la velocidad de caída
        document.getElementById('level').innerText = player.level; // Actualizar el nivel en la interfaz
    }

    draw();
    requestAnimationFrame(update);
}

// Iniciar o pausar el juego
document.getElementById('start-button').addEventListener('click', () => {
    isPaused = !isPaused; // Alternar entre pausar y reanudar

    if (!isPaused) {
        if (!player.matrix) {
            playerReset();
            update();
        } else {
            requestAnimationFrame(update);
        }
    }
});

// Actualizar la puntuación en el HTML
function updateScore(){
    document.getElementById('score').innerText = player.score; // Actualizar la puntuación en la interfaz
}

// Inicializar el lienzo
draw();



