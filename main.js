// ==== Game variables ====
let scene, camera, renderer, clock;
let player = { position: new THREE.Vector3(0, 1.6, 0), rotation: { x: 0, y: 0 } };
let moveKeys = { w: false, a: false, s: false, d: false };
let pointerLocked = false;
let interactables = [];

// Quiz data
const multimediaQuizData = [
    { question: "Apa kepanjangan dari RGB dalam konteks multimedia?", options: ["Red Green Blue", "Random Generated Bitmap", "Real Graphics Base", "Rendered Game Board"], correct: 0 },
    { question: "Format file audio yang menggunakan kompresi lossy adalah?", options: ["WAV", "FLAC", "MP3", "AIFF"], correct: 2 },
    { question: "Resolusi standar untuk video HD adalah?", options: ["720x480", "1280x720", "1920x1080", "3840x2160"], correct: 1 },
    { question: "Dalam multimedia, apa yang dimaksud dengan 'streaming'?", options: ["Menyimpan file", "Mengunduh file", "Memutar konten secara real-time", "Mengompres data"], correct: 2 },
    { question: "Format gambar yang mendukung transparansi adalah?", options: ["JPEG", "PNG", "BMP", "GIF"], correct: 1 },
    { question: "Berapa bit per pixel pada gambar RGB 24-bit?", options: ["8 bit", "16 bit", "24 bit", "32 bit"], correct: 2 },
    { question: "Codec video yang paling umum digunakan untuk streaming adalah?", options: ["MPEG-2", "H.264", "DivX", "WMV"], correct: 1 },
    { question: "Dalam produksi audio, apa yang dimaksud dengan 'sampling rate'?", options: ["Kualitas suara", "Jumlah sample per detik", "Volume audio", "Format file"], correct: 1 }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;

// Crossword data (contoh sudah diperbaiki sesuai permintaan)
const multimediaCrosswordData = {
  grid: [
    // Grid 15x15, isi huruf sesuai posisi kata
    [ '', '', '', '', 'M', 'O', 'N', 'I', 'T', 'O', 'R', ''],
    [ '', '', '', '', 'U', '', '', '', '', '', '', ''],
    [ '', '', '', '', 'L', '', '', '', '', '', '', ''],
    [ '', '', 'I', 'N', 'T', 'E', 'R', 'A', 'K', 'T', 'I', 'F'],
    [ '', '', '', '', 'I', '', '', '', '', '', '', ''],
    [ 'J', '', '', '', 'M', 'I', 'C', '', '', '', '', ''],
    [ 'P', 'R', 'O', 'C', 'E', 'S', 'S', 'O', 'R', '', '', ''],
    [ 'E', '', '', '', 'D', '', '', '', '', '', '', ''],
    [ 'G', '', '', 'V', 'I', 'D', 'E', 'O', '', '', '', ''],
    [ '', '', '', '', 'A', '', '', '', '', '', '', ''],
  ],
  clues: {
    across: [
      { number: 1, clue: "Perangkat keras untuk menampilkan gambar dan video pada komputer.", answer: "MONITOR", row: 0, col: 4 },
      { number: 5, clue: "Komponen utama dalam sebuah komputer atau laptop, yang berperan layaknya otak dari sistem dan yang mengolah data multimedia adalah.", answer: "PROCESSOR", row: 6, col: 0 },
      { number: 7, clue: "Teknologi yang membuat pengguna dapat berinteraksi langsung dengan konten multimedia.", answer: "INTERAKTIF", row: 3, col: 2 },
      { number: 6, clue: "Media yang mengandung gerakan dan suara.", answer: "VIDEO", row: 8, col: 3 },
      { number: 2, clue: "Perangkat untuk merekam suara dalam multimedia.", answer: "MIC", row: 5, col: 4 }
    ],
    down: [
      { number: 4, clue: "Format file gambar yang umum digunakan dalam multimedia.", answer: "JPEG", row: 5, col: 0 },
      { number: 3, clue: "Gabungan berbagai media seperti teks, gambar, suara, dan video disebut ____.", answer: "MULTIMEDIA", row: 0, col: 4 }
    ]
  }
};

// Inisialisasi & fungsi game
function init() {
    simulateLoading();
}

function simulateLoading() {
    const progressFill = document.getElementById('progressFill');
    let progress = 0;

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('mainMenu').classList.remove('hidden');
            }, 500);
        }
        progressFill.style.width = progress + '%';
    }, 200);
}

function showInstructions() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('instructionsMenu').classList.remove('hidden');
}

function hideInstructions() {
    document.getElementById('instructionsMenu').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('file/Plaster007_1K-JPG_Color.jpg');
const ceilingTexture = textureLoader.load('file/Plaster007_1K-JPG_Color.jpg');

// Modifikasi fungsi startGame
function startGame() {
    // Cleanup terlebih dahulu jika game sudah pernah diinisialisasi
    if (gameInitialized) {
        cleanupGame();
    }
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameControls').classList.remove('hidden');
    document.getElementById('crosshair').classList.remove('hidden');

    initThreeJS();
    createClassroom();
    animate();
    setupControls();
    createFloor();
    
    gameInitialized = true;
}


const colorTexture = textureLoader.load('file/WoodFloor051_1K-JPG_Roughness.jpg');
colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
colorTexture.repeat.set(4, 4);

colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
colorTexture.repeat.set(4, 4);

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: colorTexture,
        roughness: 0.7,
        metalness: 0.1,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

function initThreeJS() {
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    clock = new THREE.Clock();

    camera.position.copy(player.position);
}

function createClassroom() {
    scene.background = new THREE.Color(0xfafafa); // warna latar belakang yang lembut

    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

    // Cahaya atas dari langit-langit
    const ceilingLight1 = new THREE.PointLight(0xffffff, 0.6, 20);
    ceilingLight1.position.set(0, 5.8, 0);
    scene.add(ceilingLight1);

    // Tambahkan beberapa lampu lagi agar rata
    const ceilingLight2 = new THREE.PointLight(0xffffff, 0.4, 15);
    ceilingLight2.position.set(-6, 5.8, -6);
    scene.add(ceilingLight2);

    const ceilingLight3 = new THREE.PointLight(0xffffff, 0.4, 15);
    ceilingLight3.position.set(6, 5.8, -6);
    scene.add(ceilingLight3);

    const ceilingLight4 = new THREE.PointLight(0xffffff, 0.4, 15);
    ceilingLight4.position.set(-6, 5.8, 6);
    scene.add(ceilingLight4);

    const ceilingLight5 = new THREE.PointLight(0xffffff, 0.4, 15);
    ceilingLight5.position.set(6, 5.8, 6);
    scene.add(ceilingLight5);

    // Lantai
 createFloor();
    // Tambahkan 5 lampu di langit-langit
addCeilingLamp(0, 0);
addCeilingLamp(-6, -6);
addCeilingLamp(6, -6);
addCeilingLamp(-6, 6);
addCeilingLamp(6, 6);




    createWalls();
    createBlackboard();
    createVideoAndPDFScreens();
    createFurniture();
    createMultipleYouTubeAndPDFScreens();


}



function createWalls() {
    const wallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMaterial);
    backWall.position.set(0, 3, -10);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMaterial);
    frontWall.position.set(0, 3, 10);
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    const sideWallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), sideWallMaterial);
    leftWall.position.set(-10, 3, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), sideWallMaterial);
    rightWall.position.set(10, 3, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Langit-langit
    const ceilingMaterial = new THREE.MeshLambertMaterial({ map: ceilingTexture });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 6, 0);
    scene.add(ceiling);
}
function addCeilingLamp(x, z) {
    // Lampu visual (bola putih)
     const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({ emissive: 0xffffee, emissiveIntensity: 1, color: 0x000000 });
    const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulbMesh.position.set(x, 5.8, z);
    bulbMesh.castShadow = true;
    scene.add(bulbMesh);

    const light = new THREE.PointLight(0xffffff, 0.8, 12);
    light.position.set(x, 5.8, z);
    light.castShadow = true;

    // Konfigurasi bayangan agar bagus
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 20;

    scene.add(light);
}



function createBlackboard() {
    // Papan tulis kiri untuk Quiz
    const leftFrameGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
    leftFrame.position.set(-3, 3, -9.8);
    leftFrame.castShadow = true;
    scene.add(leftFrame);

    const leftBoardGeometry = new THREE.PlaneGeometry(3.5, 2.5);
    const leftBoardMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    const leftBoard = new THREE.Mesh(leftBoardGeometry, leftBoardMaterial);
    leftBoard.position.set(-3, 3, -9.6);
    scene.add(leftBoard);

    // Papan tulis kanan untuk Crossword
    const rightFrameGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
    rightFrame.position.set(3, 3, -9.8);
    rightFrame.castShadow = true;
    scene.add(rightFrame);

    const rightBoardGeometry = new THREE.PlaneGeometry(3.5, 2.5);
    const rightBoardMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    const rightBoard = new THREE.Mesh(rightBoardGeometry, rightBoardMaterial);
    rightBoard.position.set(3, 3, -9.6);
    scene.add(rightBoard);

    // Area quiz (papan kiri)
    const quizArea = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.5),
        new THREE.MeshLambertMaterial({ color: 0x2F4F2F, transparent: true, opacity: 0.01 })
    );
    quizArea.position.set(-3, 3, -9.5);
    quizArea.userData = { type: 'quiz', name: 'Quiz Multimedia' };
    scene.add(quizArea);
    interactables.push(quizArea);

    // Area crossword (papan kanan)
    const crosswordArea = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.5),
        new THREE.MeshLambertMaterial({ color: 0x2F4F2F, transparent: true, opacity: 0.01 })
    );
    crosswordArea.position.set(3, 3, -9.5);
    crosswordArea.userData = { type: 'crossword', name: 'Teka-Teki Silang' };
    scene.add(crosswordArea);
    interactables.push(crosswordArea);

    // Membuat teks 3D untuk label Quiz dan Crossword (tanpa border)
    createRealText3D("QUIZ", -3, 5, -9.4, 0xFFC537);        // Emas
    createRealText3D("CROSSWORD", 3, 5, -9.4, 0xFFC537);    // Biru langit
}

// Fungsi untuk membuat teks 3D yang realistis dengan TextGeometry
function createRealText3D(text, x, y, z, color = 0xFFFFFF) {
    const loader = new THREE.FontLoader();
    
    // Load font dari CDN Three.js
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', 
        function (font) {
            const textGeometry = new THREE.TextGeometry(text, {
                font: font,
                size: 0.3,
                height: 0.08,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.015,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5
            });
            
            // Center text
            textGeometry.computeBoundingBox();
            const centerOffsetX = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
            const centerOffsetY = -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
            
            const textMaterial = new THREE.MeshLambertMaterial({ 
                color: color,
                transparent: false
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            
            textMesh.position.set(x + centerOffsetX, y + centerOffsetY, z);
            textMesh.castShadow = true;
            textMesh.receiveShadow = true;
            scene.add(textMesh);
        },
        // Progress callback
        function (xhr) {
            console.log('Font loading: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback - fallback ke simple 3D text
        function (err) {
            console.log('Font loading failed, using simple 3D text');
            createSimple3DText(text, x, y, z, color);
        }
    );
}

// Fungsi fallback untuk teks 3D sederhana jika font gagal dimuat
function createSimple3DText(text, x, y, z, color = 0xFFFFFF) {
    const letterWidth = 0.25;
    const letterHeight = 0.4;
    const letterDepth = 0.08;
    const letterSpacing = 0.35;
    
    for (let i = 0; i < text.length; i++) {
        const letterGeometry = new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth);
        const letterMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: false
        });
        
        const letter = new THREE.Mesh(letterGeometry, letterMaterial);
        const offsetX = i * letterSpacing - (text.length - 1) * letterSpacing / 2;
        letter.position.set(x + offsetX, y, z);
        letter.castShadow = true;
        letter.receiveShadow = true;
        scene.add(letter);
    }
}
function createVideoScreens() {
    const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    // Contoh screen di kiri dan kanan (sebelumnya)
    for (let i = 0; i < 3; i++) {
        const screenGeometry = new THREE.PlaneGeometry(3, 2);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-9.8, 2 + (i * 1.5), -6 + (i * 4));
        screen.rotation.y = Math.PI / 2;
        scene.add(screen);

        const videoArea = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2),
            new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.01 })
        );
        videoArea.position.copy(screen.position);
        videoArea.position.x = -9.7;
        videoArea.rotation.y = Math.PI / 2;
        videoArea.userData = { type: 'video', name: `Video Pembelajaran ${i + 1}` };
        scene.add(videoArea);
        interactables.push(videoArea);
    }

    for (let i = 0; i < 3; i++) {
        const screenGeometry = new THREE.PlaneGeometry(3, 2);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(9.8, 2 + (i * 1.5), -6 + (i * 4));
        screen.rotation.y = -Math.PI / 2;
        scene.add(screen);

        const videoArea = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2),
            new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.01 })
        );
        videoArea.position.copy(screen.position);
        videoArea.position.x = 9.7;
        videoArea.rotation.y = -Math.PI / 2;
        videoArea.userData = { type: 'video', name: `Video Pembelajaran ${i + 4}` };
        scene.add(videoArea);
        interactables.push(videoArea);
    }
}

// Fungsi tambahan untuk YouTube thumbnail dan PDF di dinding kiri kelas
function createVideoAndPDFScreens() {
    const screenMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // YouTube thumbnail
    const ytScreenGeometry = new THREE.PlaneGeometry(4, 2.25);
    const ytScreen = new THREE.Mesh(ytScreenGeometry, screenMaterial);
    ytScreen.position.set(-9.8, 3, 0);
    ytScreen.rotation.y = Math.PI / 2;
    ytScreen.userData = { type: 'youtube', videoId: 'Mk-oDuOhHSU' };
    scene.add(ytScreen);
    interactables.push(ytScreen);



    
}
function createFurniture() {
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

    // ==== Meja dan kursi murid ====
    const deskGeometry = new THREE.BoxGeometry(2, 0.2, 1);
    const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const chairGeometry = new THREE.BoxGeometry(1, 0.1, 1);

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = -6 + col * 4;
            const z = -2 + row * 4;

            const desk = new THREE.Mesh(deskGeometry, deskMaterial);
            desk.position.set(x, 1, z);
            desk.castShadow = true;
            scene.add(desk);

            const legOffsets = [
                [-0.95, 0.5, -0.45],
                [0.95, 0.5, -0.45],
                [-0.95, 0.5, 0.45],
                [0.95, 0.5, 0.45]
            ];
            legOffsets.forEach(([dx, dy, dz]) => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(x + dx, dy, z + dz);
                scene.add(leg);
            });

            const chair = new THREE.Mesh(chairGeometry, chairMaterial);
            chair.position.set(x, 0.5, z + 1.2);
            scene.add(chair);
        }
    }

    // ==== Meja Guru ====
    const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x6B4226 }));
    teacherDesk.position.set(0, 1, -8);
    scene.add(teacherDesk);

    const teacherChair = new THREE.Mesh(chairGeometry, chairMaterial);
    teacherChair.position.set(0, 0.5, -6.7);
    scene.add(teacherChair);

    // ==== Lemari arsip ====
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), new THREE.MeshStandardMaterial({ color: 0x888888 }));
    cabinet.position.set(-8, 1, 8);
    scene.add(cabinet);

    // ==== Foto Presiden dan Wapres ====
    const photoTexture1 = textureLoader.load('file/foto_presiden.jpg');
    const photoTexture2 = textureLoader.load('file/foto_wapres.jpg');
    const photoGeo = new THREE.PlaneGeometry(1, 1.3);

    const presiden = new THREE.Mesh(photoGeo, new THREE.MeshBasicMaterial({ map: photoTexture1 }));
    presiden.position.set(-2.5, 7.5, -9.8);
    scene.add(presiden);

    const wapres = new THREE.Mesh(photoGeo, new THREE.MeshBasicMaterial({ map: photoTexture2 }));
    wapres.position.set(2.5, 7.5, -9.8);
    scene.add(wapres);

    // ==== Tanaman ====
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x884422 }));
    pot.position.set(8, 0.25, -8);
    scene.add(pot);

    const plant = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 16), new THREE.MeshStandardMaterial({ color: 0x228822 }));
    plant.position.set(8, 1, -8);
    scene.add(plant);
}


function createFurniture() {
    const deskMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const deskGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
            const desk = new THREE.Mesh(deskGeometry, deskMaterial);
            desk.position.set(-4.5 + col * 3, 0.4, 2 + row * 2.5);
            desk.castShadow = true;
            scene.add(desk);

            const chairGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
            const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const chair = new THREE.Mesh(chairGeometry, chairMaterial);
            chair.position.set(-4.5 + col * 3, 0.75, 3.5 + row * 2.5);
            chair.castShadow = true;
            scene.add(chair);
        }
    }

    const teacherDeskGeometry = new THREE.BoxGeometry(3, 0.8, 1.5);
    const teacherDesk = new THREE.Mesh(teacherDeskGeometry, deskMaterial);
    teacherDesk.position.set(0, 0.4, -7);
    teacherDesk.castShadow = true;
    scene.add(teacherDesk);

    
}

// Controls setup, pointer lock, movement & interaction
function setupControls() {
    document.addEventListener('click', () => {
    const panelAktif = !document.getElementById('quizPanel').classList.contains('hidden') ||
                       !document.getElementById('crosswordPanel').classList.contains('hidden') ||
                       !document.getElementById('videoPanel').classList.contains('hidden') ||
                       !document.getElementById('youtubePanel').classList.contains('hidden') ||
                       !document.getElementById('pdfPanel').classList.contains('hidden');

    if (!pointerLocked && !panelAktif) {
        renderer.domElement.requestPointerLock();
    }
    
});

function setupControls() {
    // Remove existing event listeners terlebih dahulu
    removeEventListeners();
    
    // Add new event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    renderer.domElement.addEventListener('click', handleInteraction);
}


    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === renderer.domElement;
    });

    document.addEventListener('mousemove', (event) => {
    if (pointerLocked) {
        const mouseX = event.movementX || 0;
        const mouseY = event.movementY || 0;

        // Rotasi badan kiri kanan (yaw)
        player.rotation.y -= mouseX * 0.002;

        // Geser posisi kamera naik turun berdasarkan mouseY
        player.position.y -= mouseY * 0.01; // sesuaikan sensitivitas

        // Batasi posisi Y supaya gak terlalu tinggi atau rendah
        player.position.y = Math.min(Math.max(player.position.y, 1), 3);

        // Update posisi dan rotasi kamera
        camera.position.copy(player.position);
        camera.rotation.y = player.rotation.y;
        camera.rotation.x = 0; // tetap lurus, tidak miring
        camera.rotation.z = 0;
    }
    });


    
    document.addEventListener('keydown', (event) => {
    if (!document.getElementById('crosswordPanel').classList.contains('hidden')) {
        // Jangan jalankan kontrol game jika crossword aktif
        return;
    }
    // ... kode kontrol game seperti WASD dll ...
});
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW': moveKeys.w = true; break;
            case 'KeyA': moveKeys.a = true; break;
            case 'KeyS': moveKeys.s = true; break;
            case 'KeyD': moveKeys.d = true; break;
            case 'Escape': handleEscape(); break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW': moveKeys.w = false; break;
            case 'KeyA': moveKeys.a = false; break;
            case 'KeyS': moveKeys.s = false; break;
            case 'KeyD': moveKeys.d = false; break;
        }
    });

    renderer.domElement.addEventListener('click', handleInteraction);
}
function handlePointerLockChange() {
    pointerLocked = document.pointerLockElement === renderer.domElement;
}
function handleMouseMove(event) {
    if (pointerLocked) {
        const mouseX = event.movementX || 0;
        const mouseY = event.movementY || 0;

        player.rotation.y -= mouseX * 0.002;
        player.position.y -= mouseY * 0.01;
        player.position.y = Math.min(Math.max(player.position.y, 1), 3);

        camera.position.copy(player.position);
        camera.rotation.y = player.rotation.y;
        camera.rotation.x = 0;
        camera.rotation.z = 0;
    }
}
function handleKeyDown(event) {
    if (!document.getElementById('crosswordPanel').classList.contains('hidden')) {
        return;
    }
    
    switch (event.code) {
        case 'KeyW': moveKeys.w = true; break;
        case 'KeyA': moveKeys.a = true; break;
        case 'KeyS': moveKeys.s = true; break;
        case 'KeyD': moveKeys.d = true; break;
        case 'Escape': handleEscape(); break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveKeys.w = false; break;
        case 'KeyA': moveKeys.a = false; break;
        case 'KeyS': moveKeys.s = false; break;
        case 'KeyD': moveKeys.d = false; break;
    }
}

// Modifikasi window resize handler
window.addEventListener('resize', () => {
    if (camera && renderer && gameInitialized) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Cleanup saat page unload
window.addEventListener('beforeunload', () => {
    cleanupGame();
});


function handleClick() {
    const panelAktif = !document.getElementById('quizPanel').classList.contains('hidden') ||
                       !document.getElementById('crosswordPanel').classList.contains('hidden') ||
                       !document.getElementById('videoPanel').classList.contains('hidden') ||
                       !document.getElementById('youtubePanel').classList.contains('hidden') ||
                       !document.getElementById('pdfPanel').classList.contains('hidden');

    if (!pointerLocked && !panelAktif) {
        renderer.domElement.requestPointerLock();
    }
}
// Fungsi cleanup game yang komprehensif
function cleanupGame() {
    // Stop animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Exit pointer lock
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
    pointerLocked = false;
    
    // Reset player state
    player.position.set(0, 1.6, 0);
    player.rotation.x = 0;
    player.rotation.y = 0;
    
    // Reset movement keys
    moveKeys = { w: false, a: false, s: false, d: false };
    
    // Clear scene dan dispose resources
    if (scene) {
        // Dispose semua geometries dan materials
        scene.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        // Clear scene
        while(scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }
    
    // Dispose renderer
    if (renderer) {
        renderer.dispose();
        const canvas = renderer.domElement;
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }
    
    // Reset interactables
    interactables = [];
    
    // Reset game state
    gameInitialized = false;
    
    // Clear any iframes
    document.getElementById('youtubeIframe').src = '';
    document.getElementById('pdfIframe').src = '';
    
    console.log('Game cleaned up successfully');
}

// Tambahkan variabel global untuk tracking state
let animationId = null;
let gameInitialized = false;

// Modifikasi fungsi handleEscape
function handleEscape() {
    if (document.getElementById('quizPanel').classList.contains('hidden') &&
        document.getElementById('crosswordPanel').classList.contains('hidden') &&
        document.getElementById('videoPanel').classList.contains('hidden') &&
        document.getElementById('youtubePanel').classList.contains('hidden') &&
        document.getElementById('pdfPanel').classList.contains('hidden')
    ) {
        // Cleanup game sebelum kembali ke menu
        cleanupGame();
        
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameControls').classList.add('hidden');
        document.getElementById('crosshair').classList.add('hidden');
    } else {
        closeAllPanels();
    }
}

function handleInteraction() {
    if (!pointerLocked) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(interactables);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        const userData = object.userData;

        if (userData.type === 'quiz') {
            openPanel('quiz');
            initQuiz();
        } else if (userData.type === 'crossword') {
            openPanel('crossword');
            initCrossword();
        } else if (userData.type === 'video') {
            openPanel('video');
        } else if (userData.type === 'youtube') {
            openYouTubePanel(userData.videoId);
        } else if (userData.type === 'pdf') {
            openPDFPanel(userData.pdfUrl);
        }
    }
}



function openPanel(type) {
        
    closeAllPanels();
    const panel = document.getElementById(type + 'Panel');
    panel.classList.remove('hidden');

    // Matikan pointer lock jika masih aktif (untuk semua jenis panel)
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }

    pointerLocked = false;  // pastikan status kontrol juga diupdate

    // Fokus input pertama jika crossword
    if (type === 'crossword') {
        const inputs = panel.querySelectorAll('input');
        for (const input of inputs) {
            if (input.value.trim() === '') {
                input.focus();
                break;
            }
        }
    }
}

function closeAllPanels() {
    document.getElementById('youtubePanel').classList.add('hidden');
    document.getElementById('pdfPanel').classList.add('hidden');
    document.getElementById('quizPanel').classList.add('hidden');
    document.getElementById('crosswordPanel').classList.add('hidden');

    document.getElementById('youtubeIframe').src = '';
    document.getElementById('pdfIframe').src = '';

    // Nyalakan musik kembali jika sebelumnya aktif, dan user sudah pernah play
    if (musicWasPlaying && musicHasBeenPlayed) {
        music.play().catch(err => {
            console.warn("Gagal memutar ulang musik:", err);
        });
        musicWasPlaying = false; // reset
    }
}



function openYouTubePanel(videoId) {
    closeAllPanels();
    musicWasPlaying = !music.paused; // catat status musik
    if (musicWasPlaying) music.pause(); // pause jika sedang aktif


    const panel = document.getElementById('youtubePanel');
    panel.classList.remove('hidden');
    const iframe = document.getElementById('youtubeIframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    if (document.pointerLockElement) document.exitPointerLock();
    pointerLocked = false;
}


function openPDFPanel(pdfUrl) {
    closeAllPanels();
    musicWasPlaying = !music.paused;
    if (musicWasPlaying) music.pause();

    const panel = document.getElementById('pdfPanel');
    panel.classList.remove('hidden');
    const iframe = document.getElementById('pdfIframe');
    iframe.src = pdfUrl;

    if (document.pointerLockElement) document.exitPointerLock();
    pointerLocked = false;
}



function createMultipleYouTubeAndPDFScreens() {
  const screenMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const loader = new THREE.TextureLoader();

  // YouTube screens dengan error handling
  const ytData = [
    { videoId: 'rO87H7beUIk', position: new THREE.Vector3(-9.8, 3, -5) },
    { videoId: 'Mk-oDuOhHSU', position: new THREE.Vector3(-9.8, 3, 0) },
    { videoId: '8miET8q-TZE', position: new THREE.Vector3(-9.8, 3, 5) },
  ];

  ytData.forEach((yt) => {
    // Gunakan thumbnail alternatif atau fallback
    const thumbnailUrl = `https://img.youtube.com/vi/${yt.videoId}/maxresdefault.jpg`;
    
    loader.load(
      thumbnailUrl,
      // onLoad - berhasil
      (texture) => {
        const ytScreenGeometry = new THREE.PlaneGeometry(4, 2.25);
        const ytScreenMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const ytScreen = new THREE.Mesh(ytScreenGeometry, ytScreenMaterial);
        ytScreen.position.copy(yt.position);
        ytScreen.rotation.y = Math.PI / 2;
        ytScreen.userData = { type: 'youtube', videoId: yt.videoId };
        scene.add(ytScreen);
        interactables.push(ytScreen);
      },
      // onProgress - loading
      undefined,
      // onError - jika gagal load thumbnail
      (error) => {
        console.warn(`Failed to load YouTube thumbnail for ${yt.videoId}:`, error);
        
        // Buat screen dengan warna solid sebagai fallback
        const ytScreenGeometry = new THREE.PlaneGeometry(4, 2.25);
        const fallbackMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x333333,
          transparent: true,
          opacity: 0.8
        });
        const ytScreen = new THREE.Mesh(ytScreenGeometry, fallbackMaterial);
        ytScreen.position.copy(yt.position);
        ytScreen.rotation.y = Math.PI / 2;
        ytScreen.userData = { type: 'youtube', videoId: yt.videoId };
        scene.add(ytScreen);
        interactables.push(ytScreen);
        
        // Tambahkan text label (opsional)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        context.fillStyle = '#ffffff';
        context.font = '32px Arial';
        context.textAlign = 'center';
        context.fillText('YouTube Video', 256, 128);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
          map: textTexture,
          transparent: true
        });
        ytScreen.material = textMaterial;
      }
    );
  });

  // PDF screens dengan error handling
  const pdfData = [
    {
      pdfUrl: 'file/sistem multimedia komplit.pdf',
      thumbUrl: 'file/buku_pak_ahmad.png',
      position: new THREE.Vector3(9.8, 3, -5)
    },
    {
      pdfUrl: 'file/Multimedia-2nd.pdf',
      thumbUrl: 'file/multimedia-second.jpg',
      position: new THREE.Vector3(9.8, 3, 0)
    },
    {
      pdfUrl: 'file/MultimediaInterkatif.pdf',
      thumbUrl: 'file/multimedia-interaktif.jpg',
      position: new THREE.Vector3(9.8, 3, 5)
    },
  ];

  pdfData.forEach((pdf) => {
    loader.load(
      pdf.thumbUrl,
      // onLoad - berhasil
      (texture) => {
        const pdfScreenGeometry = new THREE.PlaneGeometry(4, 2.25);
        const pdfScreenMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const pdfScreen = new THREE.Mesh(pdfScreenGeometry, pdfScreenMaterial);
        pdfScreen.position.copy(pdf.position);
        pdfScreen.rotation.y = -Math.PI / 2;
        pdfScreen.userData = { type: 'pdf', pdfUrl: pdf.pdfUrl };
        scene.add(pdfScreen);
        interactables.push(pdfScreen);
      },
      // onProgress
      undefined,
      // onError - jika gagal load thumbnail PDF
      (error) => {
        console.warn(`Failed to load PDF thumbnail: ${pdf.thumbUrl}`, error);
        
        // Buat screen dengan warna solid sebagai fallback
        const pdfScreenGeometry = new THREE.PlaneGeometry(4, 2.25);
        const fallbackMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x444444,
          transparent: true,
          opacity: 0.8
        });
        const pdfScreen = new THREE.Mesh(pdfScreenGeometry, fallbackMaterial);
        pdfScreen.position.copy(pdf.position);
        pdfScreen.rotation.y = -Math.PI / 2;
        pdfScreen.userData = { type: 'pdf', pdfUrl: pdf.pdfUrl };
        scene.add(pdfScreen);
        interactables.push(pdfScreen);
        
        // Tambahkan text label untuk PDF
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        context.fillStyle = '#ffffff';
        context.font = '32px Arial';
        context.textAlign = 'center';
        context.fillText('PDF Document', 256, 128);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
          map: textTexture,
          transparent: true
        });
        pdfScreen.material = textMaterial;
      }
    );
  });
}

// Tambahkan function untuk mengurangi console error
function suppressCORSErrors() {
  // Override console.error untuk menyaring CORS errors yang tidak relevan
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    // Jangan tampilkan error Google Play services
    if (message.includes('play.google.com') || 
        message.includes('CORS') ||
        message.includes('401')) {
      return; // Skip error ini
    }
    originalError.apply(console, args);
  };
}

// Panggil function ini di awal untuk mengurangi spam error
suppressCORSErrors();

function closePanel(type) {
    document.getElementById(type + 'Panel').classList.add('hidden');
    if(type === 'youtube'){
        document.getElementById('youtubeIframe').src = '';
    }
    if(type === 'pdf'){
        document.getElementById('pdfIframe').src = '';
    }
}

function updatePlayer() {
    const speed = 0.1;
    const direction = new THREE.Vector3();

    if (moveKeys.w) direction.z -= 1;
    if (moveKeys.s) direction.z += 1;
    if (moveKeys.a) direction.x -= 1;
    if (moveKeys.d) direction.x += 1;

    if (direction.length() > 0) {
        direction.normalize();
        direction.multiplyScalar(speed);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

        const newPosition = player.position.clone().add(direction);

        if (Math.abs(newPosition.x) < 9.5 && Math.abs(newPosition.z) < 9.5) {
            player.position.copy(newPosition);
        }
    }

    camera.position.copy(player.position);
    camera.rotation.x = player.rotation.x;
    camera.rotation.y = player.rotation.y;
}


function animate() {
    animationId = requestAnimationFrame(animate);

    if (pointerLocked) {
        updatePlayer();
    }

    renderer.render(scene, camera);
}

// ==== Quiz functions ====
function initQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    showQuestion();
}

function showQuestion() {
    const question = multimediaQuizData[currentQuestion];
    document.getElementById('questionText').textContent = `${currentQuestion + 1}. ${question.question}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index, optionDiv);
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('nextBtn').style.display = 'none';
    selectedAnswer = null;
}

function selectOption(index, element) {
    if (selectedAnswer !== null) return;

    selectedAnswer = index;
    const question = multimediaQuizData[currentQuestion];
    const options = document.querySelectorAll('#optionsContainer .option');

    options.forEach((option, i) => {
        if (i === question.correct) {
            option.classList.add('correct');
        } else if (i === index && i !== question.correct) {
            option.classList.add('incorrect');
        } else {
            option.style.opacity = '0.5';
        }
    });

    if (index === question.correct) {
        score++;
    }

    document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < multimediaQuizData.length) {
        showQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    document.getElementById('finalScore').textContent = `Skor Anda: ${score}/${multimediaQuizData.length}`;
}

function restartQuiz() {
    initQuiz();
}

// ==== Crossword functions ====
// ==== Crossword functions ====

function initCrossword() {
    const crosswordGridElem = document.getElementById('crosswordGrid');
    const cols = multimediaCrosswordData.grid[0].length;
    crosswordGridElem.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    createCrosswordGrid();
    showCrosswordClues();
    addArrowKeyNavigation(); // tambahkan navigasi panah atas/bawah
}

function createCrosswordGrid() {
    const grid = document.getElementById('crosswordGrid');
    grid.innerHTML = '';

    const rows = multimediaCrosswordData.grid.length;
    const cols = multimediaCrosswordData.grid[0].length;

    // Simpan array nomor per posisi, karena bisa lebih dari satu nomor di satu kotak
    const numberPositions = {};

    multimediaCrosswordData.clues.across.forEach(clue => {
        const key = `${clue.row}-${clue.col}`;
        if (!numberPositions[key]) {
            numberPositions[key] = [];
        }
        numberPositions[key].push(clue.number);
    });

    multimediaCrosswordData.clues.down.forEach(clue => {
        const key = `${clue.row}-${clue.col}`;
        if (!numberPositions[key]) {
            numberPositions[key] = [];
        }
        numberPositions[key].push(clue.number);
    });

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'crossword-cell';

            if (multimediaCrosswordData.grid[i][j] === '') {
                cell.classList.add('black');
            } else {
                cell.classList.add('white');
                cell.style.position = 'relative';

                const key = `${i}-${j}`;
                if (numberPositions[key]) {
                    const numberLabel = document.createElement('div');
                    // Gabungkan semua nomor dalam array, misal: "1,3"
                    numberLabel.textContent = numberPositions[key].join(',');
                    numberLabel.style.position = 'absolute';
                    numberLabel.style.top = '2px';
                    numberLabel.style.left = '2px';
                    numberLabel.style.fontSize = '10px';
                    numberLabel.style.fontWeight = 'bold';
                    numberLabel.style.color = '#667eea';
                    numberLabel.style.userSelect = 'none';
                    cell.appendChild(numberLabel);
                }

                const input = document.createElement('input');
                input.maxLength = 1;
                input.dataset.row = i;
                input.dataset.col = j;
                input.dataset.answer = multimediaCrosswordData.grid[i][j];
                cell.appendChild(input);
            }

            grid.appendChild(cell);
        }
    }
}

function showCrosswordClues() {
    const acrossClues = document.getElementById('acrossClues');
    const downClues = document.getElementById('downClues');

    acrossClues.innerHTML = '';
    downClues.innerHTML = '';

    multimediaCrosswordData.clues.across.forEach(clue => {
        const clueDiv = document.createElement('div');
        clueDiv.className = 'clue';
        clueDiv.textContent = `${clue.number}. ${clue.clue}`;
        acrossClues.appendChild(clueDiv);
    });

    multimediaCrosswordData.clues.down.forEach(clue => {
        const clueDiv = document.createElement('div');
        clueDiv.className = 'clue';
        clueDiv.textContent = `${clue.number}. ${clue.clue}`;
        downClues.appendChild(clueDiv);
    });
}

function checkCrossword() {
    const inputs = document.querySelectorAll('#crosswordGrid input');
    let correct = 0;
    let total = 0;

    inputs.forEach(input => {
        total++;
        if (input.value.toUpperCase() === input.dataset.answer) {
            input.style.backgroundColor = '#d4edda';
            input.style.borderColor = '#28a745';
            correct++;
        } else {
            input.style.backgroundColor = '#f8d7da';
            input.style.borderColor = '#dc3545';
        }
    });

    alert(`Anda menjawab ${correct} dari ${total} kotak dengan benar!`);
}

function resetCrossword() {
    const inputs = document.querySelectorAll('#crosswordGrid input');
    inputs.forEach(input => {
        input.value = '';
        input.style.backgroundColor = '';
        input.style.borderColor = '';
    });
}

// Fungsi tambahan untuk navigasi dengan tombol panah atas dan bawah
function addArrowKeyNavigation() {
    const inputs = document.querySelectorAll('#crosswordGrid input');
    inputs.forEach(input => {
        input.addEventListener('keydown', (event) => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            let targetInput;

            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    targetInput = document.querySelector(`#crosswordGrid input[data-row="${row - 1}"][data-col="${col}"]`);
                    if (targetInput) targetInput.focus();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    targetInput = document.querySelector(`#crosswordGrid input[data-row="${row + 1}"][data-col="${col}"]`);
                    if (targetInput) targetInput.focus();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    targetInput = document.querySelector(`#crosswordGrid input[data-row="${row}"][data-col="${col - 1}"]`);
                    if (targetInput) targetInput.focus();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    targetInput = document.querySelector(`#crosswordGrid input[data-row="${row}"][data-col="${col + 1}"]`);
                    if (targetInput) targetInput.focus();
                    break;
            }
        });
    });
}



// Window resize handler
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

init();

let music = document.getElementById('bgMusic');
let musicWasPlaying = false;
let musicBtn = document.getElementById('musicBtn');
let volumeSlider = document.getElementById('volumeSlider');
let volumeDisplay = document.getElementById('volumeDisplay');

// Set volume awal
music.volume = 0.5; // 50% volume

function toggleMusic() {
    if (music.paused) {
        music.play().then(() => {
            musicHasBeenPlayed = true;
            document.getElementById("musicBtn").textContent = "Pause Music";
        }).catch(err => {
            console.warn("Gagal memutar musik:", err);
        });
    } else {
        music.pause();
        document.getElementById("musicBtn").textContent = "Play Music";
    }
}

function changeVolume() {
  let volume = volumeSlider.value;
  music.volume = volume;
  volumeDisplay.textContent = Math.round(volume * 100) + '%';
}

// Mute/Unmute dengan double click
function toggleMute() {
  if (music.volume > 0) {
    music.volume = 0;
    volumeSlider.value = 0;
    volumeDisplay.textContent = '0%';
  } else {
    music.volume = 0.5;
    volumeSlider.value = 0.5;
    volumeDisplay.textContent = '50%';
  }
}
