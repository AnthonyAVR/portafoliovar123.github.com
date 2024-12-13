let countdown;
let timer;
let timeRemaining = 0; // Para la cuenta regresiva
let elapsedTime = 0;   // Para el cronómetro
let isCountingDown = false;

// Función para actualizar el temporizador en la pantalla
function updateDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Función para iniciar la cuenta regresiva
function startCountdown(minutes, seconds) {
    timeRemaining = minutes * 60 + seconds; // Convertir minutos a segundos
    isCountingDown = true;
    updateDisplay();

    countdown = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            const countdownMinutes = Math.floor(timeRemaining / 60);
            const countdownSeconds = timeRemaining % 60;
            document.getElementById('timer').textContent = 
                `${String(countdownMinutes).padStart(2, '0')}:${String(countdownSeconds).padStart(2, '0')}`;
        } else {
            clearInterval(countdown);
            alert("¡El tiempo ha terminado!");
            isCountingDown = false;
        }
    }, 1000);
}

// Función para iniciar el cronómetro
function startTimer() {
    isCountingDown = false;
    elapsedTime = 0; // Reiniciar el tiempo
    updateDisplay();

    timer = setInterval(() => {
        elapsedTime++;
        updateDisplay();
    }, 1000);
}

// Función para manejar el clic en el botón "Iniciar Cuenta Regresiva"
document.getElementById('startCountdownButton').addEventListener('click', () => {
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;

    if (minutes < 0 || seconds < 0 || seconds >= 60) {
        alert("Por favor, introduce un número válido de minutos y segundos.");
        return;
    }

    clearInterval(timer); // Detener el cronómetro si está corriendo
    startCountdown(minutes, seconds);
});

// Función para manejar el clic en el botón "Iniciar Cronómetro"
document.getElementById('startTimerButton').addEventListener('click', () => {
    clearInterval(countdown); // Detener la cuenta regresiva si está corriendo
    startTimer();
});

// Función para detener la cuenta regresiva o el cronómetro
document.getElementById('stopButton').addEventListener('click', () => {
    clearInterval(countdown);
    clearInterval(timer);
    isCountingDown = false;
});

// Función para reiniciar el cronómetro y la cuenta regresiva
document.getElementById('resetButton').addEventListener('click', () => {
    clearInterval(countdown); // Detener la cuenta regresiva
    clearInterval(timer);      // Detener el cronómetro
    timeRemaining = 0;        // Restablecer el tiempo restante a 0
    elapsedTime = 0;          // Restablecer el tiempo transcurrido a 0
    updateDisplay();          // Actualizar la visualización para mostrar "00:00"
});






