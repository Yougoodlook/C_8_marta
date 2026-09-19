// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    particleCount: 6000,
    particleSize: 0.02,
    particleColor: 0x00ccff,
    
    phases: {
        appearance: { start: 0, end: 3 },
        pulsation: { start: 3, end: 5 },
        destruction: { start: 5, end: 7 },
        maxDeformation: { start: 7, end: 9 },
        assembly: { start: 9, end: 12 },
        finalState: { start: 12, end: 15 }
    },
    
    cycleDuration: 15
};

// ==================== КЭШИРОВАНИЕ ЗНАЧЕНИЙ ====================
const PHASE_NAMES = Object.keys(CONFIG.phases);
const PHASE_DURATIONS = {};

Object.entries(CONFIG.phases).forEach(([name, { start, end }]) => {
    PHASE_DURATIONS[name] = end - start;
});

// ==================== НЕОНОВЫЕ ЦВЕТА ====================
const NEON_COLORS = [
    { r: 0, g: 204, b: 255 },      // Cyan
    { r: 0, g: 255, b: 200 },      // Light Cyan
    { r: 100, g: 200, b: 255 },    // Light Blue
    { r: 0, g: 230, b: 255 },      // Bright Cyan
    { r: 50, g: 220, b: 255 },     // Sky Cyan
    { r: 0, g: 255, b: 255 },      // Pure Cyan
];

// ==================== КЛАСС ЧАСТИЦЫ ====================
class Particle {
    constructor(position, targetPosition) {
        this.position = position.clone();
        this.targetPosition = targetPosition.clone();
        this.baseTargetPosition = targetPosition.clone();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        
        this.alpha = 0;
        this.brightness = 0.5;
        this.distanceFromCenter = position.length();
        
        // Неоновый цвет
        const colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
        this.neonColor = NEON_COLORS[colorIndex];
        this.colorVariation = 0.8 + Math.random() * 0.4;
        
        // Параметры колыхания
        this.waveOffsetX = Math.random() * Math.PI * 2;
        this.waveOffsetY = Math.random() * Math.PI * 2;
        this.waveOffsetZ = Math.random() * Math.PI * 2;
        this.waveAmplitude = 0.08;
        this.waveFrequency = 2 + Math.random() * 2;
        
        // Предрассчитанные значения
        this.direction = new THREE.Vector3();
        this.tempVec = new THREE.Vector3();
        this.waveVec = new THREE.Vector3();
    }
    
    reset() {
        // Сброс состояния для нового цикла
        this.position.copy(this.baseTargetPosition);
        this.velocity.set(0, 0, 0);
        this.acceleration.set(0, 0, 0);
        this.alpha = 0;
        this.brightness = 0.5;
    }
    
    update(deltaTime, phase, time) {
        // Используем кэшированные методы обновления
        this.updateMethods[phase]?.call(this, deltaTime, time);
        
        // Затухание и обновление позиции
        this.velocity.multiplyScalar(0.98);
        this.position.addScaledVector(this.velocity, deltaTime);
        this.acceleration.set(0, 0, 0);
    }
    
    getWavePosition(time, phase) {
        const waveX = Math.sin(time * this.waveFrequency + this.waveOffsetX) * this.waveAmplitude;
        const waveY = Math.cos(time * this.waveFrequency + this.waveOffsetY) * this.waveAmplitude;
        const waveZ = Math.sin(time * this.waveFrequency * 0.7 + this.waveOffsetZ) * this.waveAmplitude * 0.5;
        
        this.waveVec.set(waveX, waveY, waveZ);
        
        if (phase === 'destruction' || phase === 'maxDeformation' || phase === 'assembly') {
            this.waveVec.multiplyScalar(0.3);
        }
        
        return this.waveVec;
    }
    
    updateAppearance(deltaTime, time) {
        const phaseDuration = PHASE_DURATIONS.appearance;
        const phaseTime = time - CONFIG.phases.appearance.start;
        const progress = Math.min(phaseTime / phaseDuration, 1);
        
        this.alpha = progress;
        
        // Появление из случайной точки
        const randomStartPos = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        );
        this.position.lerp(this.baseTargetPosition, progress);
        
        this.brightness = 0.4 + Math.sin(time * 2) * 0.2;
    }
    
    updatePulsation(deltaTime, time) {
        const phaseTime = time - CONFIG.phases.pulsation.start;
        
        this.alpha = 1;
        const pulseAmount = Math.sin(phaseTime * Math.PI * 3) * 0.08;
        const targetScale = 1 + pulseAmount;
        
        this.direction.copy(this.baseTargetPosition).normalize();
        this.tempVec.copy(this.direction).multiplyScalar(this.distanceFromCenter * targetScale);
        
        const wave = this.getWavePosition(time, 'pulsation');
        this.tempVec.add(wave);
        
        this.position.lerp(this.tempVec, 0.1);
        this.brightness = 0.7 + Math.sin(time * 3) * 0.15 + Math.random() * 0.1;
    }
    
    updateDestruction(deltaTime, time) {
        const phaseDuration = PHASE_DURATIONS.destruction;
        const phaseTime = time - CONFIG.phases.destruction.start;
        const progress = phaseTime / phaseDuration;
        
        this.alpha = 1 - progress * 0.2; // частицы становятся чуть прозрачнее
        
        this.direction.copy(this.position).normalize();
        this.acceleration.addScaledVector(this.direction, 0.8 * progress);
        this.velocity.addScaledVector(this.acceleration, deltaTime);
        
        if (this.baseTargetPosition.y > 0) {
            this.acceleration.y += 0.5 * progress;
        }
        
        this.brightness = 0.6 + Math.sin(time * 4) * 0.2;
    }
    
    updateMaxDeformation(deltaTime, time) {
        this.alpha = 1 - 0.2;
        
        const rotationAxis = Particle.rotationAxis;
        const angle = time * Math.PI * deltaTime * 0.5;
        
        this.position.applyAxisAngle(rotationAxis, angle);
        
        this.acceleration.x += (Math.random() - 0.5) * 0.3;
        this.acceleration.y += (Math.random() - 0.5) * 0.3;
        this.acceleration.z += (Math.random() - 0.5) * 0.3;
        
        this.velocity.addScaledVector(this.acceleration, deltaTime);
        
        if (Math.random() < 0.02) {
            this.direction.copy(this.position).normalize();
            this.velocity.addScaledVector(this.direction, -0.5);
        }
        
        this.brightness = 0.5 + Math.sin(time * 5) * 0.3;
    }
    
    updateAssembly(deltaTime, time) {
        const phaseDuration = PHASE_DURATIONS.assembly;
        const phaseTime = time - CONFIG.phases.assembly.start;
        const progress = phaseTime / phaseDuration;
        
        this.alpha = 1;
        
        this.direction.subVectors(this.baseTargetPosition, this.position).normalize();
        const distance = this.position.distanceTo(this.baseTargetPosition);
        const attractionForce = Math.min(distance * 3, 1) * progress;
        
        this.acceleration.addScaledVector(this.direction, attractionForce);
        this.velocity.addScaledVector(this.acceleration, deltaTime);
        this.position.lerp(this.baseTargetPosition, 0.15 + progress * 0.1);
        
        this.brightness = 0.6 + Math.sin(time * 3) * 0.15;
    }
    
    updateFinalState(deltaTime, time) {
        this.alpha = 1;
        
        const phaseTime = time - CONFIG.phases.finalState.start;
        
        // Плавное перемещение к целевой позиции с колыханием
        const wave = this.getWavePosition(time, 'finalState');
        this.targetPosition.copy(this.baseTargetPosition).add(wave);
        
        this.position.lerp(this.targetPosition, 0.1);
        
        this.brightness = 0.7 + Math.sin(time * 2) * 0.15 + Math.random() * 0.1;
    }
    
    updateMethods = {
        appearance: this.updateAppearance,
        pulsation: this.updatePulsation,
        destruction: this.updateDestruction,
        maxDeformation: this.updateMaxDeformation,
        assembly: this.updateAssembly,
        finalState: this.updateFinalState
    }
}

Particle.rotationAxis = new THREE.Vector3(0, 1, 0);

// ==================== ГЕНЕРАТОР ФОРМЫ СЕРДЦА ====================
function generateHeartShape(count) {
    const points = [];
    const scale = 2;
    
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 2;
        
        points.push(new THREE.Vector3(
            (x / 16) * scale,
            (y / 16) * scale,
            z * 0.5
        ));
    }
    
    return points;
}

// ==================== ОСНОВНОЙ КЛАСС АНИМАЦИИ ====================
class HeartAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            precision: 'mediump',
            logarithmicDepthBuffer: false
        });
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.createParticles();
        this.setupPostProcessing();
        
        this.animationTime = 0;
        this.lastTime = Date.now();
        this.frameCount = 0;
        this.cycleCount = 0;
        
        this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);
        
        window.addEventListener('resize', this.onWindowResize);
        this.animate();
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
    }
    
    setupCamera() {
        this.camera.position.z = 5;
    }
    
    setupLighting() {
        const mainLight = new THREE.PointLight(0x00ffff, 2);
        mainLight.position.set(2, 2, 3);
        this.scene.add(mainLight);
        this.mainLight = mainLight;
        
        this.bottomLight = new THREE.PointLight(0x0099ff, 1.5);
        this.bottomLight.position.set(0, -5, 0);
        this.scene.add(this.bottomLight);
        
        const sideLight = new THREE.PointLight(0x00ccff, 1);
        sideLight.position.set(-3, 0, 2);
        this.scene.add(sideLight);
        this.sideLight = sideLight;
        
        const ambientLight = new THREE.AmbientLight(0x1a1a4d, 0.6);
        this.scene.add(ambientLight);
    }
    
    setupPostProcessing() {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    createParticles() {
        this.heartShape = generateHeartShape(CONFIG.particleCount);
        this.particles = [];
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const colors = new Float32Array(CONFIG.particleCount * 3);
        const sizes = new Float32Array(CONFIG.particleCount);
        
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const startPos = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            
            const particle = new Particle(startPos, this.heartShape[i]);
            this.particles.push(particle);
            
            const idx = i * 3;
            positions[idx] = startPos.x;
            positions[idx + 1] = startPos.y;
            positions[idx + 2] = startPos.z;
            
            const colorVar = particle.colorVariation;
            colors[idx] = (particle.neonColor.r / 255) * colorVar;
            colors[idx + 1] = (particle.neonColor.g / 255) * colorVar;
            colors[idx + 2] = (particle.neonColor.b / 255) * colorVar;
            
            sizes[i] = CONFIG.particleSize + Math.random() * 0.01;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: CONFIG.particleSize,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            emissive: new THREE.Color(0x00ccff),
            emissiveIntensity: 1.2,
            opacity: 0.95,
            fog: false,
            side: THREE.DoubleSide
        });
        
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
        
        this.positionAttribute = geometry.getAttribute('position');
        this.colorAttribute = geometry.getAttribute('color');
        this.sizeAttribute = geometry.getAttribute('size');
        this.material = material;
    }
    
    getCurrentPhase(time) {
        const cycleTime = time % CONFIG.cycleDuration;
        
        if (cycleTime < 3) return 'appearance';
        if (cycleTime < 5) return 'pulsation';
        if (cycleTime < 7) return 'destruction';
        if (cycleTime < 9) return 'maxDeformation';
        if (cycleTime < 12) return 'assembly';
        return 'finalState';
    }
    
    resetCycle() {
        // Сброс всех частиц для новго цикла
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].reset();
        }
        this.cycleCount++;
    }
    
    updateParticles(deltaTime) {
        const phase = this.getCurrentPhase(this.animationTime);
        const positions = this.positionAttribute.array;
        const colors = this.colorAttribute.array;
        const sizes = this.sizeAttribute.array;
        
        // Проверяем, начался ли новый цикл
        const cycleTime = this.animationTime % CONFIG.cycleDuration;
        if (cycleTime < deltaTime) {
            this.resetCycle();
        }
        
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const particle = this.particles[i];
            particle.update(deltaTime, phase, cycleTime); // используем cycleTime вместо animationTime
            
            const idx = i * 3;
            positions[idx] = particle.position.x;
            positions[idx + 1] = particle.position.y;
            positions[idx + 2] = particle.position.z;
            
            const brightnessModifier = 0.6 + particle.brightness * 0.8;
            colors[idx] = (particle.neonColor.r / 255) * brightnessModifier;
            colors[idx + 1] = (particle.neonColor.g / 255) * brightnessModifier;
            colors[idx + 2] = (particle.neonColor.b / 255) * brightnessModifier;
            
            sizes[i] = CONFIG.particleSize * (0.6 + particle.brightness * 0.8);
        }
        
        this.positionAttribute.needsUpdate = true;
        this.colorAttribute.needsUpdate = true;
        this.sizeAttribute.needsUpdate = true;
        
        this.material.emissiveIntensity = 0.8 + Math.sin(cycleTime * 2) * 0.4;
    }
    
    updateLighting() {
        const cycleTime = this.animationTime % CONFIG.cycleDuration;
        const sinTime2 = Math.sin(cycleTime * 2);
        const sinTime3 = Math.sin(cycleTime * 1.5);
        
        this.mainLight.intensity = 1.8 + sinTime2 * 0.4;
        this.bottomLight.intensity = 1.3 + sinTime3 * 0.4;
        
        const angle = cycleTime * 0.5;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        
        this.mainLight.position.x = cosAngle * 3;
        this.mainLight.position.z = sinAngle * 3;
        
        this.sideLight.position.x = Math.cos(angle + Math.PI) * 3;
        this.sideLight.position.z = Math.sin(angle + Math.PI) * 2;
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.animationTime += deltaTime;
        
        this.updateParticles(deltaTime);
        this.updateLighting();
        
        this.renderer.render(this.scene, this.camera);
        
        this.frameCount++;
    }
    
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    dispose() {
        window.removeEventListener('resize', this.onWindowResize);
        this.points.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
let animation;

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    animation = new HeartAnimation(canvas);
});

window.addEventListener('beforeunload', () => {
    animation?.dispose();
});
