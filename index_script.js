const canvas = document.getElementById('heart');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Текст твоей песни
        const lyrics = "С 8 Марта, моя хорошая! Желаю тебе быть всегда такой же яркой, стильной и неотразимой. Пусть в твоей жизни будет поменьше поводов для грусти и побольше — для радости, путешествий и приятных сюрпризов".split(' ');
        
        const activeWords = [];
        let wordIndex = 0;
        let spawnTimer = 0;
        const spawnDelay = 25; // Как часто вылетают слова

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Формула сердца
        function getHeartPoint(t) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return { x, y };
        }

        function animate() {
            // Очистка экрана с небольшим шлейфом
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const scale = 18; // Размер сердца

            // 1. Создаем новое слово
            spawnTimer++;
            if (spawnTimer >= spawnDelay) {
                activeWords.push({
                    text: lyrics[wordIndex],
                    t: 0, 
                    speed: 0.012, 
                    fontSize: 28,
                    // Используем HSLA для удобной работы с прозрачностью в будущем
                    color: { h: 330 + Math.random() * 30, s: 80, l: 80 }
                });
                wordIndex = (wordIndex + 1) % lyrics.length;
                spawnTimer = 0;
            }

            // 2. Двигаем и рисуем
            for (let i = activeWords.length - 1; i >= 0; i--) {
                const p = activeWords[i];
                p.t += p.speed;

                if (p.t > Math.PI * 2) {
                    activeWords.splice(i, 1);
                    continue;
                }

                // Эффекты затухания и размера
                const progress = p.t / (Math.PI * 2);
                const alpha = Math.sin(progress * Math.PI); // Проявляется и гаснет
                const size = p.fontSize * (1 - progress * 0.5); // Уменьшается к концу

                const pos = getHeartPoint(p.t);
                const x = cx + pos.x * scale;
                const y = cy + pos.y * scale;

                ctx.font = `bold ${size}px Arial`;
                ctx.fillStyle = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${alpha})`;
                
                // Свечение (опционально, можно убрать если лагает)
                ctx.shadowBlur = 10 * alpha;
                ctx.shadowColor = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${alpha})`;

                ctx.fillText(p.text, x, y);
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(animate);
        }

        animate();
