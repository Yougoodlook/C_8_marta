const songs = [
    'music/song1.mp3',
    'music/song2.mp3',
    'music/song3.mp3',
    'music/song4.mp3',
    'music/song5.mp3',
    'music/song6.mp3',
    'music/song7.mp3',
    'music/song8.mp3',
    'music/song9.mp3',
    'music/song10.mp3',
    'music/song11.mp3',
    'music/song12.mp3',
    'music/song13.mp3',
];

// Получаем индекс песни из localStorage
let currentSong = parseInt(localStorage.getItem('currentSong')) || 0;

// Получаем состояние воспроизведения
let isPlaying = localStorage.getItem('isPlaying') === 'true';

const audio = new Audio(songs[currentSong]);

// DOM элементы
const widget = document.getElementById('musicWidget');
const controls = document.getElementById('musicControls');
const playPauseBtn = document.getElementById('playPause');
const nextBtn = document.getElementById('nextSong');
const prevBtn = document.getElementById('prevSong');

// Воспроизведение в зависимости от состояния
if (isPlaying) {
    audio.play();
}

// Обновляем текст кнопки
playPauseBtn.textContent = isPlaying ? '⏯ Пауза' : '▶ Играть';

// Показ/скрытие панели
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

// Пауза / Играть
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

// 🔁 Автоматически следующая песня после окончания
audio.addEventListener('ended', () => {
    currentSong = (currentSong + 1) % songs.length;
    audio.src = songs[currentSong];
    audio.play();

    isPlaying = true;
    playPauseBtn.textContent = '⏯ Пауза';

    syncStorage();
});

// Сохраняем состояние
function syncStorage() {
    localStorage.setItem('currentSong', currentSong);
    localStorage.setItem('isPlaying', isPlaying);
}

// Синхронизация между вкладками
window.addEventListener('storage', (event) => {

    if (event.key === 'currentSong' || event.key === 'isPlaying') {

        currentSong = parseInt(localStorage.getItem('currentSong')) || 0;
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
