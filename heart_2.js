const canvas = document.getElementById('heartCanvas');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Твои слова для сердца
        const lyrics = "Любовь Радость Красота Весна Нежность Счастье Улыбки Цветы Тепло".split(' ');

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Математика сердца
        function getHeartPoint(t) {
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return { x, y };
        }

        const particles = [];
        const particleCount = 60; // Количество слов на экране одновременно

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                t: Math.random() * Math.PI * 2,
                speed: 0.005 + Math.random() * 0.01,
                word: lyrics[Math.floor(Math.random() * lyrics.length)],
                fontSize: 12 + Math.random() * 14,
                color: `hsla(${330 + Math.random() * 30}, 80%, 75%, 0.8)`
            });
        }

        function draw() {
            // Очищаем экран почти полностью (0.3 дает короткий след)
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            
            // Динамический масштаб (биение)
            const pulse = Math.sin(Date.now() * 0.002) * 5 + 18;

            particles.forEach(p => {
                p.t += p.speed;
                const pos = getHeartPoint(p.t);

                ctx.font = `bold ${p.fontSize}px Arial`;
                ctx.fillStyle = p.color;
                
                // Добавляем свечение буквам
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;

                const x = cx + pos.x * pulse;
                const y = cy + pos.y * pulse;

                ctx.fillText(p.word, x, y);
                
                // Сброс тени для производительности
                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(draw);
        }

        draw();