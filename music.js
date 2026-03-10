const songs = [
    'music/song1.mp3',
    'music/song2.mp3',
    'music/song3.mp3',
    'music/song4.mp3',
    'music/song5.mp3',
    'music/song6.mp3',
    'music/song7.mp3',
    'music/song8.mp3',
    'music/Byuro_-_Treshhiny_74698913.mp3',
    'music/Byuro_-_Vse_eshhe_lyudi_80304268.mp3',
    'music/EMIN_JONY_-_Kamin_68951744.mp3',
    'music/Gio_Pika_MIRAVI_-_Mir_2024_77903135.mp3',
    'music/Miyagi_Amigo_-_Samaya_47829535.mp3',
    'music/NYU_-_Ne_ubivajj_68462521.mp3',
    'music/Sunshine.mp3',
    'music/Xcho_-_JEskizy_73418778.mp3',
    'music/ZHenya_Trofimov_-_Samolety_78089953.mp3',
    'music/gera_amen_-_SOLNCE_VSTALO_77973306.mp3',
    'music/miyagi-amp-jendshpil-feat.-rem-digga-i-got-love.mp3',
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
