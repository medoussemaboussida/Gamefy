import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

// ─────────────────────────────────────────────
// Helper builders
// ─────────────────────────────────────────────

function buildRoom(scene) {
    // Floor – light grey/white polished
    const floorGeo = new THREE.PlaneGeometry(14, 10);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0xd8d8d8,
        roughness: 0.35,
        metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(14, 10);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4;
    scene.add(ceil);

    // Walls
    // Walls – clean white
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });

    // Subtle accent strip at the bottom of each wall
    const accentMat = new THREE.MeshStandardMaterial({
        color: 0x7733ff,
        emissive: 0x5522cc,
        emissiveIntensity: 0.6,
    });
    const walls = [
        { pos: [0, 2, -5], rot: [0, 0, 0], w: 14, h: 4 },          // back
        { pos: [0, 2, 5], rot: [0, Math.PI, 0], w: 14, h: 4 },      // front
        { pos: [-7, 2, 0], rot: [0, Math.PI / 2, 0], w: 10, h: 4 }, // left
        { pos: [7, 2, 0], rot: [0, -Math.PI / 2, 0], w: 10, h: 4 }, // right
    ];
    walls.forEach(({ pos, rot, w, h }) => {
        const geo = new THREE.PlaneGeometry(w, h);
        const mesh = new THREE.Mesh(geo, wallMat);
        mesh.position.set(...pos);
        mesh.rotation.set(...rot);
        mesh.receiveShadow = true;
        scene.add(mesh);

        // Accent strip at bottom of wall
        const stripGeo = new THREE.PlaneGeometry(w, 0.15);
        const strip = new THREE.Mesh(stripGeo, accentMat);
        strip.position.set(pos[0], 0.08, pos[2]);
        strip.rotation.set(rot[0], rot[1], rot[2]);
        // Offset slightly in front of wall
        const dir = new THREE.Vector3(0, 0, 0.01);
        dir.applyEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
        strip.position.add(dir);
        scene.add(strip);
    });
}

function buildNeonStrips(scene) {
    const colors = [
        { color: 0x7b00ff, pos: [-6.8, 3.6, 0], rot: [0, Math.PI / 2, 0], len: 9.5 }, // left wall purple
        { color: 0x00d4ff, pos: [6.8, 3.6, 0], rot: [0, -Math.PI / 2, 0], len: 9.5 }, // right wall cyan
        { color: 0xff00cc, pos: [0, 3.9, -4.8], rot: [0, 0, 0], len: 13 },             // back wall magenta
        { color: 0x7b00ff, pos: [-3, 3.9, 0], rot: [0, 0, 0], len: 13 },              // ceiling strip 1
        { color: 0x00d4ff, pos: [3, 3.9, 0], rot: [0, 0, 0], len: 13 },               // ceiling strip 2
    ];

    const strips = [];
    colors.forEach(({ color, pos, rot, len }) => {
        const geo = new THREE.BoxGeometry(
            rot[1] === 0 ? len : 0.06,
            0.06,
            rot[1] !== 0 ? len : 0.06
        );
        const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 4,
        });
        const strip = new THREE.Mesh(geo, mat);
        strip.position.set(...pos);
        strip.rotation.set(...rot);
        scene.add(strip);
        strips.push(strip);

        // Point light for glow — big radius to illuminate the room
        const light = new THREE.PointLight(color, 3, 14);
        light.position.set(...pos);
        scene.add(light);
    });
    return strips;
}

function buildGamingChair(color = 0x111111) {
    const group = new THREE.Group();

    const seatMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

    // Seat base
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), seatMat);
    seat.position.y = 0.45;
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.07), seatMat);
    back.position.set(0, 0.85, -0.24);
    group.add(back);

    // Headrest
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.07), seatMat);
    head.position.set(0, 1.27, -0.24);
    group.add(head);

    // Legs (4 small cylinders)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45), legMat);
        leg.position.set(x, 0.22, z);
        group.add(leg);
    });

    return group;
}

function buildMonitor() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x002244,
        emissive: 0x3366aa,
        emissiveIntensity: 1.5,
    });

    // Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.38, 0.03), screenMat);
    screen.position.y = 0.62;
    group.add(screen);

    // Frame border
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.42, 0.025), frameMat);
    frame.position.y = 0.62;
    frame.position.z = -0.005;
    group.add(frame);

    // Stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), standMat);
    neck.position.y = 0.35;
    group.add(neck);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.18), standMat);
    base.position.y = 0.22;
    group.add(base);

    return group;
}

function buildLongTable(length = 10) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.1 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333344 });

    // Long tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 1.2), mat);
    top.position.y = 0.75;
    group.add(top);

    // Table legs at intervals
    const legSpacing = length / 4;
    for (let i = 0; i <= 4; i++) {
        const xPos = -length / 2 + i * legSpacing;
        [[-0.55], [0.55]].forEach(([z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), legMat);
            leg.position.set(xPos, 0.37, z);
            group.add(leg);
        });
    }

    // Center divider strip along the table (subtle)
    const divMat = new THREE.MeshStandardMaterial({ color: 0x444466 });
    const divider = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.04), divMat);
    divider.position.set(0, 0.79, 0);
    group.add(divider);

    return group;
}

function buildPCCase(color = 0xff00ff) {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ 
        color: 0x333344, 
        transparent: true, 
        opacity: 0.4, 
        roughness: 0.1 
    });
    
    // Main case body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.42), caseMat);
    body.position.y = 0.225;
    group.add(body);

    // Glass side panel (on one side)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), glassMat);
    glass.position.set(0.111, 0.225, 0);
    glass.rotation.y = Math.PI / 2;
    group.add(glass);

    // RGB Fans inside (3 simple circles)
    const fanMat = new THREE.MeshStandardMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 2 
    });
    for (let i = 0; i < 3; i++) {
        const fan = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), fanMat);
        fan.position.set(0.08, 0.12 + i * 0.12, 0);
        fan.rotation.y = Math.PI / 2;
        group.add(fan);
        
        const light = new THREE.PointLight(color, 0.4, 1);
        light.position.set(0.05, 0.12 + i * 0.12, 0);
        group.add(light);
    }

    return group;
}

function buildPCSeat(x, z, facingZ = 1) {
    // A single PC seat: monitor sitting ON the table + keyboard + chair facing outward
    const group = new THREE.Group();

    // Monitor sits ON TOP of the table (table top at y=0.75, monitor base starts at y=0.22 internally)
    const monitor = buildMonitor();
    monitor.rotation.y = facingZ > 0 ? 0 : Math.PI; // Face the correct side
    monitor.position.set(0, 0.56, -facingZ * 0.15); // lift up so base rests on table surface
    group.add(monitor);

    // Keyboard in front of monitor on the table
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12 });
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.15), kbMat);
    kb.position.set(0, 0.78, facingZ * 0.05); // Move onto table
    group.add(kb);

    // RGB glow on keyboard
    const rgbColors = [0xff2200, 0x00ff88, 0x00aaff, 0xff00ff, 0xffaa00];
    const rgbColor = rgbColors[Math.floor(Math.random() * rgbColors.length)];
    const rgbMat = new THREE.MeshStandardMaterial({
        color: rgbColor,
        emissive: rgbColor,
        emissiveIntensity: 1.5,
    });
    const rgb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.005, 0.01), rgbMat);
    rgb.position.set(0, 0.79, facingZ * 0.12); // Move onto table
    group.add(rgb);

    // PC Case on the LEFT of the monitor
    const pcCase = buildPCCase(rgbColor);
    pcCase.position.set(-facingZ * 0.55, 0.78, -facingZ * 0.15);
    pcCase.rotation.y = facingZ > 0 ? 0 : Math.PI;
    group.add(pcCase);

    // Gaming chair facing THE TABLE
    const chair = buildGamingChair(0x1a1a1a);
    chair.position.set(0, 0, facingZ * 1.1);
    chair.rotation.y = facingZ > 0 ? Math.PI : 0;
    group.add(chair);

    group.position.set(x, 0, z);
    return group;
}

function buildPS5Setup(x, z, rotY = 0) {
    const group = new THREE.Group();

    // Wall-mounted TV
    const tvFrameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const tvScreenMat = new THREE.MeshStandardMaterial({
        color: 0x002244,
        emissive: 0x0088ff,
        emissiveIntensity: 2,
    });
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.82, 0.06), tvFrameMat);
    tvFrame.position.set(0, 1.8, 0);
    group.add(tvFrame);

    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.76, 0.04), tvScreenMat);
    tvScreen.position.set(0, 1.8, 0.015);
    group.add(tvScreen);

    // Couch / seat area facing the TV (z=0)
    const couchMat = new THREE.MeshStandardMaterial({ color: 0x0d0d1a, roughness: 0.9 });
    const couchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.7), couchMat);
    couchSeat.position.set(0, 0.3, 0.9);
    group.add(couchSeat);

    const couchBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.2), couchMat);
    couchBack.position.set(0, 0.55, 1.25);
    group.add(couchBack);

    // Console shelf below TV
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.06, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x222233 })
    );
    shelf.position.set(0, 0.95, 0.1);
    group.add(shelf);

    // PS5 console (simplified white wedge shape)
    const ps5Mat = new THREE.MeshStandardMaterial({ color: 0xddddee, roughness: 0.4 });
    const ps5 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.2), ps5Mat);
    ps5.position.set(0.05, 1.01, 0.1);
    group.add(ps5);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    return group;
}

function buildDisplayShelf(x, z, rotY = 0) {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.8 });
    const shelfLight = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
    });

    // Main cabinet
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.35), whiteMat);
    cabinet.position.y = 1.2;
    group.add(cabinet);

    // 3 rows × 2 columns of shelves
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.3), shelfLight);
            shelf.position.set(-0.46 + col * 0.92, 0.6 + row * 0.7, 0.05);
            group.add(shelf);

            // Item silhouette on shelf
            const itemMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.6 });
            const item = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.15), itemMat);
            item.position.set(-0.46 + col * 0.92, 0.77 + row * 0.7, 0.05);
            group.add(item);
        }
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    return group;
}

function buildReceptionDesk(x, z) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });

    const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.55), mat);
    top.position.y = 0.9;
    group.add(top);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.55), mat);
    body.position.y = 0.45;
    group.add(body);

    // Laptop
    const lapMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const lapScreen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.03), lapMat);
    lapScreen.position.set(0, 1.1, -0.12);
    lapScreen.rotation.x = -Math.PI / 5;
    group.add(lapScreen);

    const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.26), lapMat);
    lapBase.position.set(0, 0.93, 0.02);
    group.add(lapBase);

    group.position.set(x, 0, z);
    return group;
}

// ─── Big Window ──────────────────────────────────
function buildBigWindow(scene) {
    const group = new THREE.Group();
    // Glass plane
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.25,
        roughness: 0.05,
        metalness: 0.9,
        emissive: 0x113355,
        emissiveIntensity: 0.4,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), glassMat);
    glass.position.set(0, 2.1, 4.97); // Slightly in front of front wall (z=5)
    glass.rotation.y = Math.PI; 
    group.add(glass);

    // Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.3 });
    const frames = [
        { w: 10.2, h: 0.1, d: 0.1, x: 0, y: 3.7 },    // top
        { w: 10.2, h: 0.1, d: 0.1, x: 0, y: 0.5 },    // bottom
        { w: 0.1, h: 3.2, d: 0.1, x: -5.05, y: 2.1 }, // left
        { w: 0.1, h: 3.2, d: 0.1, x: 5.05, y: 2.1 },  // right
        { w: 0.05, h: 3.2, d: 0.08, x: 0, y: 2.1 },   // middle vertical
    ];
    frames.forEach(f => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(f.w, f.h, f.d), frameMat);
        mesh.position.set(f.x, f.y, 4.97);
        group.add(mesh);
    });

    // Rod
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 10.4), rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 3.7, 4.93);
    group.add(rod);

    // Curtains (deep purple fabric)
    const curtainMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a0a2a, 
        roughness: 0.9,
    });
    [[-4.6, 1], [4.6, -1]].forEach(([cx, scaleX]) => {
        const curtain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 0.15), curtainMat);
        curtain.position.set(cx, 2.1, 4.9);
        // Add a bit of "folding" look using scales if needed, but simple is better
        group.add(curtain);
    });

    scene.add(group);
}

// ─────────────────────────────────────────────
// Label overlay component
// ─────────────────────────────────────────────
function Label({ text, color = "#2BDFC8" }) {
    return (
        <div
            style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${color}55`,
                borderRadius: 8,
                padding: "5px 14px",
                color,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: `0 0 14px ${color}44`,
            }}
        >
            {text}
        </div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const VirtualTour = ({ embedded = false }) => {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const animFrameRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ── Renderer ──────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.8;
        rendererRef.current = renderer;

        // ── Scene ─────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x12082a);
        scene.fog = new THREE.Fog(0x12082a, 18, 35);

        // ── Camera ────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(
            55,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            60
        );
        camera.position.set(0, 3.5, 8.5);
        camera.lookAt(0, 1, 0);

        // ── Controls ──────────────────────────────────
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.2, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.minDistance = 4;
        controls.maxDistance = 14;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.enablePan = false;
        controls.update();

        // ── Lighting ──────────────────────────────────
        // Strong ambient so everything is visible
        const ambientLight = new THREE.AmbientLight(0x6644aa, 2.5);
        scene.add(ambientLight);

        // Hemisphere light — sky/ground fill
        const hemiLight = new THREE.HemisphereLight(0x7766cc, 0x222244, 2);
        scene.add(hemiLight);

        // Main ceiling point light
        const ceilingLight = new THREE.PointLight(0xffffff, 3, 18);
        ceilingLight.position.set(0, 3.8, 0);
        scene.add(ceilingLight);

        // Extra fill point lights spread across the room
        const fillPositions = [
            [-4, 3.5, -2], [4, 3.5, -2],
            [-4, 3.5, 2],  [4, 3.5, 2],
            [0, 3.5, -3],   [0, 3.5, 3],
        ];
        fillPositions.forEach(pos => {
            const fill = new THREE.PointLight(0x8866cc, 1.5, 12);
            fill.position.set(...pos);
            scene.add(fill);
        });

        // ── Room ──────────────────────────────────────
        buildRoom(scene);
        const neonStrips = buildNeonStrips(scene);

        // ── One long shared table in the center SHIFTED LEFT ───────
        const longTable = buildLongTable(10);
        longTable.position.set(-1.0, 0, -1.5);
        scene.add(longTable);

        // ── 5 PCs on the front side (chairs face inward) ──
        for (let i = 0; i < 5; i++) {
            const seat = buildPCSeat(-1.0 - 4 + i * 2, -1.5 + 0.5, 1); // front side
            scene.add(seat);
        }
        // ── 5 PCs on the back side (chairs face inward) ──
        for (let i = 0; i < 5; i++) {
            const seat = buildPCSeat(-1.0 - 4 + i * 2, -1.5 - 0.5, -1); // back side
            scene.add(seat);
        }

        // ── 2 PS5 TV setups on the RIGHT wall ─────────
        const ps5a = buildPS5Setup(6.2, -2.5, -Math.PI / 2);
        scene.add(ps5a);
        const ps5b = buildPS5Setup(6.2, 1.5, -Math.PI / 2);
        scene.add(ps5b);

        // ── Display shelf — right wall near corner ─────
        const shelf = buildDisplayShelf(-6.2, -3.5, Math.PI / 2);
        scene.add(shelf);

        // ── Big Window on front wall ────────────────────
        buildBigWindow(scene);

        // ── Light pillars (vertical neon columns) ──────
        [
            { c: 0x7733ff, x: -6.5, z: -4.5 },
            { c: 0x00ccff, x: -6.5, z: 4.5 },
            { c: 0x7733ff, x: 6.5, z: -4.5 },
            { c: 0x00ccff, x: 6.5, z: 4.5 },
        ].forEach(({ c, x, z }) => {
            const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 4 });
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.8, 0.05), mat);
            col.position.set(x, 1.9, z);
            scene.add(col);
            const pl = new THREE.PointLight(c, 2, 8);
            pl.position.set(x, 2, z);
            scene.add(pl);
        });

        // ── Animation loop ────────────────────────────
        let t = 0;
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            t += 0.012;

            // Pulsing neon strips
            neonStrips.forEach((strip, i) => {
                const pulse = 3 + Math.sin(t + i * 1.1) * 1;
                strip.material.emissiveIntensity = pulse;
            });

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // ── Resize ────────────────────────────────────
        const handleResize = () => {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        const ro = new ResizeObserver(handleResize);
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            ro.disconnect();
            controls.dispose();
            renderer.dispose();
        };
    }, []);

    // ── Canvas + labels + stats + CTA (shared inner content) ──────────
    const canvasBlock = (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Canvas wrapper */}
            <motion.div
                variants={itemVariants}
                className="relative w-full rounded-[24px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                style={{ height: "clamp(340px, 55vw, 680px)" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />

                {/* Corner labels */}
                <div className="absolute top-4 left-4">
                    <Label text="PC Gaming Zone · 10 stations" color="#2BDFC8" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <Label text="PS5 Area" color="#DD00B8" />
                </div>

                {/* Hint overlay */}
                <div
                    className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none transition-opacity duration-500"
                    style={{ opacity: isHovered ? 0 : 1 }}
                >
                    <div style={{
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
                        borderRadius: 40, padding: "10px 22px", color: "#ffffffaa",
                        fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                            <path d="M6 14a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4.5a6.5 6.5 0 0 0 13 0V11" />
                        </svg>
                        Drag to explore · Scroll to zoom
                    </div>
                </div>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 mt-10 max-w-xl">
                {[
                    { val: "10", label: "Gaming PCs" },
                    { val: "2", label: "PS5 Setups" },
                    { val: "RGB", label: "LED Lighting" },
                ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-black text-white">{val}</span>
                        <span className="text-sm text-white/60 mt-1 uppercase tracking-wider">{label}</span>
                    </div>
                ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="mt-10 flex gap-5 items-center">
                <button className="w-[196px] h-[58px] flex items-center justify-center bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-[14px] text-white tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase">
                    Book a Station Now
                </button>
                <a href="#rooms-events" className="text-[#06F0F6] font-bold text-[14px] tracking-wide underline underline-offset-[10px] decoration-2 hover:text-white transition-all">
                    See Room Details
                </a>
            </motion.div>
        </motion.div>
    );

    // ── Embedded mode: just the canvas block ──────────────────────────
    if (embedded) return canvasBlock;

    // ── Standalone mode: full section with header ─────────────────────
    return (
        <section id="virtual-tour" className="relative bg-[#24003E] overflow-hidden font-['Inter']">
            {/* Background glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#7700ff] rounded-full blur-[200px] opacity-10 z-0 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00d4ff] rounded-full blur-[180px] opacity-10 z-0 pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20"
            >
                {/* Header */}
                <div className="mb-10 md:mb-14">
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#2BDFC8]" />
                        <span className="text-[#2BDFC8] text-xs font-bold uppercase tracking-[0.25em]">
                            Interactive 3D Tour
                        </span>
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1] mb-4 tracking-tight text-white uppercase">
                        EXPLORE{" "}
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}>
                            OUR GAMING FLOOR
                        </span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
                        Get a feel for the space before you arrive. Drag to rotate, scroll to zoom — explore Gamefy&apos;s gaming center in full 3D.
                    </motion.p>
                </div>

                {canvasBlock}
            </motion.div>
        </section>
    );
};

export default VirtualTour;

