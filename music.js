const songs = [
    'music/song1.mp3',
    'music/song2.mp3',
    'music/song3.mp3',
    'music/song4.mp3'
];

// Получаем индекс песни и состояние из localStorage или задаем по умолчанию
let currentSong = parseInt(localStorage.getItem('currentSong')) || 0;
let isPlaying = localStorage.getItem('isPlaying') === 'true' || true;

const audio = new Audio(songs[currentSong]);
audio.loop = true;

// Воспроизведение в зависимости от состояния
if (isPlaying) audio.play();

const widget = document.getElementById('musicWidget');
const controls = document.getElementById('musicControls');
const playPauseBtn = document.getElementById('playPause');
const nextBtn = document.getElementById('nextSong');
const prevBtn = document.getElementById('prevSong');

// Обновляем текст кнопки в зависимости от состояния
playPauseBtn.textContent = isPlaying ? '⏯ Пауза' : '▶ Играть';

// Показ/скрытие кнопок
widget.addEventListener('click', () => {
    widget.classList.toggle('active');
});

// Следующая песня
nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSong = (currentSong + 1) % songs.length;
    audio.src = songs[currentSong];
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = '⏯ Пауза';
    syncStorage();
});

// Предыдущая песня
prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    audio.src = songs[currentSong];
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = '⏯ Пауза';
    syncStorage();
});

// Пауза/Играть
playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏯ Пауза';
        isPlaying = true;
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶ Играть';
        isPlaying = false;
    }
    syncStorage();
});

// Сохраняем текущее состояние в localStorage
function syncStorage() {
    localStorage.setItem('currentSong', currentSong);
    localStorage.setItem('isPlaying', isPlaying);
}

// Слушаем изменения localStorage, чтобы синхронизироваться между вкладками/страницами
window.addEventListener('storage', (event) => {
    if (event.key === 'currentSong' || event.key === 'isPlaying') {
        currentSong = parseInt(localStorage.getItem('currentSong'));
        isPlaying = localStorage.getItem('isPlaying') === 'true';
        audio.src = songs[currentSong];
        if (isPlaying) {
            audio.play();
            playPauseBtn.textContent = '⏯ Пауза';
        } else {
            audio.pause();
            playPauseBtn.textContent = '▶ Играть';
        }
    }
});
