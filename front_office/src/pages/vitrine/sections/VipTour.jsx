import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// ─── Room ────────────────────────────────────────────────────────────
function buildVipRoom(scene) {
    // White/light floor like gaming room
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0xd8d8d8, 
        roughness: 0.35, 
        metalness: 0.15 
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Ceiling — ivory white
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(16, 12),
        new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4;
    scene.add(ceil);

    // Walls – white like the gaming room
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });
    const goldAccentMat = new THREE.MeshStandardMaterial({
        color: 0xffc946, 
        emissive: 0xdd9900, 
        emissiveIntensity: 0.6,
    });
    const walls = [
        { pos: [0, 2, -6], rot: [0, 0, 0], w: 16, h: 4 },   // back
        { pos: [0, 2, 6], rot: [0, Math.PI, 0], w: 16, h: 4 }, // front
        { pos: [-8, 2, 0], rot: [0, Math.PI / 2, 0], w: 12, h: 4 }, // left
        { pos: [8, 2, 0], rot: [0, -Math.PI / 2, 0], w: 12, h: 4 }, // right
    ];
    walls.forEach(({ pos, rot, w, h }) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
        wall.position.set(...pos);
        wall.rotation.set(...rot);
        scene.add(wall);
        // Gold accent strip at base
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1), goldAccentMat);
        strip.position.set(pos[0], 0.06, pos[2]);
        strip.rotation.set(...rot);
        scene.add(strip);
    });
}

// ─── Gold neon strips ────────────────────────────────────────────────
function buildVipNeonStrips(scene) {
    const strips = [];
    const colors = [0xffc946, 0xff6acc, 0x6af0ff];
    const positions = [
        { pos: [0, 3.85, 0], rot: [0, 0, 0], len: 14, axis: 'x' },
        { pos: [0, 3.85, 0], rot: [0, Math.PI / 2, 0], len: 10, axis: 'z' },
    ];
    positions.forEach(({ pos, rot, len }, i) => {
        const mat = new THREE.MeshStandardMaterial({
            color: colors[i % colors.length],
            emissive: colors[i % colors.length],
            emissiveIntensity: 3,
        });
        const strip = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.04), mat);
        strip.position.set(...pos);
        strip.rotation.set(...rot);
        scene.add(strip);
        strips.push(strip);
        const pl = new THREE.PointLight(colors[i % colors.length], 1.5, 10);
        pl.position.set(...pos);
        scene.add(pl);
    });
    return strips;
}

// ─── Monitor ─────────────────────────────────────────────────────────
function buildMonitor() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.3 });
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x001133, emissive: 0x0055cc, emissiveIntensity: 2.5,
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.38, 0.04), frameMat);
    frame.position.y = 0.22;
    group.add(frame);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.34, 0.01), screenMat);
    screen.position.set(0, 0.22, 0.025);
    group.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), frameMat);
    stand.position.y = 0.02;
    group.add(stand);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.12), frameMat);
    base.position.y = -0.06;
    group.add(base);
    return group;
}

// ─── Gaming chair ─────────────────────────────────────────────────────
function buildGamingChair(color = 0x1a1a1a) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.52), mat);
    seat.position.y = 0.46;
    group.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.6, 0.08), mat);
    back.position.set(0, 0.8, -0.22);
    group.add(back);
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.08), mat);
    headrest.position.set(0, 1.15, -0.22);
    group.add(headrest);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46), legMat);
        leg.position.set(lx, 0.23, lz);
        group.add(leg);
    });
    return group;
}

// ─── PC Case ─────────────────────────────────────────────────────────
function buildPCCase(color = 0xff00ff) {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x333344, transparent: true, opacity: 0.4, roughness: 0.1,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.42), caseMat);
    body.position.y = 0.225;
    group.add(body);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), glassMat);
    glass.position.set(-0.111, 0.225, 0); // Corrected to inside face
    glass.rotation.y = -Math.PI / 2;
    group.add(glass);
    const fanMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 });
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

// ─── Microphone ───────────────────────────────────────────────────────
function buildMicrophone() {
    const group = new THREE.Group();
    const micMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffc946, emissive: 0xcc8800, emissiveIntensity: 0.5 });
    // Boom arm
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4), micMat);
    boom.rotation.z = -Math.PI / 4; // Reversed rotation to point toward player
    boom.position.set(0.14, 0.2, 0);
    group.add(boom);
    // Mic capsule - ATTACHED to boom arm end (0.28, 0.34)
    const capsule = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12), micMat);
    capsule.position.set(0.28, 0.34, 0); 
    capsule.rotation.z = Math.PI / 2;
    group.add(capsule);
    // Gold ring accent
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.006, 6, 12), accentMat);
    ring.position.set(0.28, 0.34, 0);
    ring.rotation.y = Math.PI / 2;
    group.add(ring);
    // Stand base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 12), micMat);
    base.position.y = 0;
    group.add(base);
    return group;
}

// ─── VIP PC Station (individual desk) ───────────────────────────────
function buildVipStation(x, z) {
    const group = new THREE.Group();
    const rgbColors = [0xff2200, 0x00ff88, 0x00aaff, 0xff00ff, 0xffaa00];
    const rgbColor = rgbColors[Math.floor(Math.random() * rgbColors.length)];

    // Premium individual desk - LARGER for VIP
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e1a28, roughness: 0.4, metalness: 0.4 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.75), deskMat);
    deskTop.position.y = 0.75;
    group.add(deskTop);
    // Gold trim strip on desk edge
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xffc946, emissive: 0xcc8800, emissiveIntensity: 0.4 });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.01, 0.01), trimMat);
    trim.position.set(0, 0.78, 0.375);
    group.add(trim);
    // Legs - adjusted for wider desk
    [[-0.75, -0.32], [0.75, -0.32], [-0.75, 0.32], [0.75, 0.32]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75), legMat);
        leg.position.set(lx, 0.375, lz);
        group.add(leg);
    });

    // Monitor on desk - corrected position and rotation
    const monitor = buildMonitor();
    monitor.rotation.y = 0;               // face toward player (+Z)
    monitor.position.set(0, 0.81, -0.15); // sit on top of desk (0.75 + 0.06)
    group.add(monitor);

    // Keyboard
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12 });
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.15), kbMat);
    kb.position.set(0, 0.78, 0.1);
    group.add(kb);

    // RGB glow strip on keyboard edge
    const rgbMat = new THREE.MeshStandardMaterial({ color: rgbColor, emissive: rgbColor, emissiveIntensity: 1.5 });
    const rgb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.005, 0.01), rgbMat);
    rgb.position.set(0, 0.79, 0.18);
    group.add(rgb);

    // PC Case — on left side of desk
    const pcCase = buildPCCase(rgbColor);
    pcCase.position.set(-0.65, 0.78, 0);
    group.add(pcCase);

    // Microphone — on right side
    const mic = buildMicrophone();
    mic.position.set(0.55, 0.75, -0.1);
    group.add(mic);

    // Gaming chair — facing the desk (facing -Z direction)
    const chair = buildGamingChair(0x1a1a1a);
    chair.position.set(0, 0, 0.65);
    chair.rotation.y = Math.PI; // face toward desk
    group.add(chair);

    // Side table with amenities
    const sideTable = buildSideTable();
    sideTable.position.set(1.05, 0, 0);
    group.add(sideTable);

    group.position.set(x, 0, z);
    return group;
}

// ─── VIP Side Table (Amenities) ──────────────────────────────────
function buildSideTable() {
    const group = new THREE.Group();
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.5 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), tableMat);
    tableTop.position.y = 0.25;
    group.add(tableTop);

    // Soda Can
    const sodaMat = new THREE.MeshStandardMaterial({ color: 0xff3300, metalness: 0.8, roughness: 0.1 });
    const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12), sodaMat);
    soda.position.set(-0.08, 0.56, -0.05);
    group.add(soda);
    const sodaTop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12), 
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1 }));
    sodaTop.position.set(-0.08, 0.62, -0.05);
    group.add(sodaTop);

    // Plate and Cookies
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 14), plateMat);
    plate.position.set(0.05, 0.505, 0.05);
    group.add(plate);

    const cookieMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 1 });
    for (let i = 0; i < 3; i++) {
        const cookie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), cookieMat);
        cookie.position.set(0.02 + i*0.03, 0.525, 0.02 + Math.sin(i)*0.04);
        cookie.rotation.y = i;
        group.add(cookie);
    }

    return group;
}

// ─── Label component ─────────────────────────────────────────────────
function Label({ text, color = "#ffc946" }) {
    return (
        <div style={{
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
            border: `1px solid ${color}55`, borderRadius: 8, padding: "5px 14px",
            color, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
            boxShadow: `0 0 14px ${color}44`,
        }}>
            {text}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────
const VipTour = () => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.8;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x12082a);
        scene.fog = new THREE.Fog(0x12082a, 18, 35);

        const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 60);
        camera.position.set(0, 3.5, 9);
        camera.lookAt(0, 1, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.2, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.minDistance = 4;
        controls.maxDistance = 14;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.enablePan = false;
        controls.update();

        // Lighting - Brighter/Whiter like Gaming Room
        scene.add(new THREE.AmbientLight(0x6644aa, 2.5));
        scene.add(new THREE.HemisphereLight(0x7766cc, 0x222244, 2));
        const ceiling = new THREE.PointLight(0xffffff, 4, 20);
        ceiling.position.set(0, 3.8, 0);
        scene.add(ceiling);
        [[-5, 3.5, -3], [5, 3.5, -3], [-5, 3.5, 3], [5, 3.5, 3]].forEach(pos => {
            const fill = new THREE.PointLight(0xffc946, 1.2, 12);
            fill.position.set(...pos);
            scene.add(fill);
        });

        buildVipRoom(scene);
        const neonStrips = buildVipNeonStrips(scene);

        // ── 5 VIP stations spread ALONG THE WALLS ──────────────
        // Players face the center, wall is behind them
        const stations = [
            { x: -6.6, z: -2.5, rot: -Math.PI / 2 },  // Left Wall 
            { x: -6.6, z: 2.5,  rot: -Math.PI / 2 },  // Left Wall
            { x: 6.6,  z: -2.5, rot: Math.PI / 2 },   // Right Wall
            { x: 6.6,  z: 2.5,  rot: Math.PI / 2 },   // Right Wall
            { x: 0,    z: -4.6, rot: Math.PI },        // Back Wall
            { x: 0,    z: 4.6,  rot: 0 },              // Front Wall
        ];

        stations.forEach(({ x, z, rot }) => {
            const station = buildVipStation(x, z);
            station.rotation.y = rot;
            scene.add(station);
        });

        // Corner light pillars
        [
            { c: 0xffc946, x: -7.5, z: -5.5 },
            { c: 0xff6acc, x: -7.5, z: 5.5 },
            { c: 0xffc946, x: 7.5, z: -5.5 },
            { c: 0x6af0ff, x: 7.5, z: 5.5 },
        ].forEach(({ c, x, z }) => {
            const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 4 });
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.8, 0.05), mat);
            col.position.set(x, 1.9, z);
            scene.add(col);
            const pl = new THREE.PointLight(c, 2, 8);
            pl.position.set(x, 2, z);
            scene.add(pl);
        });

        let t = 0;
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            t += 0.012;
            neonStrips.forEach((strip, i) => {
                strip.material.emissiveIntensity = 2.5 + Math.sin(t + i * 1.3) * 1;
            });
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full"
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
                    <Label text="VIP Gaming Zone · 6 stations" color="#ffc946" />
                </div>
                <div className="absolute top-4 right-4">
                    <Label text="Private · Premium Setup" color="#ff6acc" />
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
                    { val: "6", label: "VIP PCs" },
                    { val: "MIC", label: "Each Station" },
                    { val: "GOLD", label: "LED Lighting" },
                ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-black text-white">{val}</span>
                        <span className="text-sm text-white/60 mt-1 uppercase tracking-wider">{label}</span>
                    </div>
                ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="mt-10 flex gap-5 items-center">
                <button className="w-[196px] h-[58px] flex items-center justify-center bg-gradient-to-r from-[#cc8800] to-[#ffc946] rounded-full font-medium text-[14px] text-black tracking-wide shadow-[0_0_30px_rgba(255,201,70,0.35)] hover:scale-105 transition-all uppercase">
                    Book VIP Now
                </button>
                <a href="#rooms-events" className="text-[#ffc946] font-bold text-[14px] tracking-wide underline underline-offset-[10px] decoration-2 hover:text-white transition-all">
                    See Room Details
                </a>
            </motion.div>
        </motion.div>
    );
};

export default VipTour;
