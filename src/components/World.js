/**
 * World Component - Creates the 3D environment with ground, roads, houses, and interactive objects
 * IMPROVED VERSION - Enhanced graphics with houses, street lights, and better visuals
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CONFIG from '../utils/config.js';

export class World {
    constructor(physicsManager, sceneManager) {
        this.physicsManager = physicsManager;
        this.sceneManager = sceneManager;
        
        this.interactiveObjects = [];
        this.pushableObjects = [];
        this.streetLights = [];
        
        this.init();
    }

    init() {
        this.createGround();
        this.createRoads();
        this.createSidewalks();
        this.createHouses();
        this.createStreetLights();
        this.createInteractiveObjects();
        this.createTrees();
        this.createClouds();
        this.createBoundaries();
    }

    createGround() {
        const { groundSize, groundColor } = CONFIG.world;

        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: groundColor,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.sceneManager.add(groundMesh);

        const groundBody = this.physicsManager.createPlane();
        this.physicsManager.getWorld().addBody(groundBody);
    }

    createRoads() {
        const { groundSize, roadColor, roadWidth } = CONFIG.world;

        const roadMaterial = new THREE.MeshStandardMaterial({
            color: roadColor,
            roughness: 0.85,
            metalness: 0.05
        });

        const mainRoadGeometry = new THREE.PlaneGeometry(roadWidth, groundSize * 0.9);
        const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
        mainRoad.rotation.x = -Math.PI / 2;
        mainRoad.position.y = 0.02;
        mainRoad.receiveShadow = true;
        this.sceneManager.add(mainRoad);

        const crossRoadGeometry = new THREE.PlaneGeometry(groundSize * 0.9, roadWidth);
        const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial);
        crossRoad.rotation.x = -Math.PI / 2;
        crossRoad.position.y = 0.02;
        crossRoad.receiveShadow = true;
        this.sceneManager.add(crossRoad);

        this.createRoadMarkings(roadWidth, groundSize);
        this.createRoadEdges(roadWidth, groundSize);
    }

    createRoadMarkings(roadWidth, groundSize) {
        const markingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            emissive: 0xffffff,
            emissiveIntensity: 0.1
        });

        const dashLength = 4;
        const dashGap = 3;
        const dashWidth = 0.25;

        for (let z = -groundSize * 0.4; z < groundSize * 0.4; z += dashLength + dashGap) {
            const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
            const dash = new THREE.Mesh(dashGeometry, markingMaterial);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(0, 0.03, z);
            this.sceneManager.add(dash);
        }

        for (let x = -groundSize * 0.4; x < groundSize * 0.4; x += dashLength + dashGap) {
            const dashGeometry = new THREE.PlaneGeometry(dashLength, dashWidth);
            const dash = new THREE.Mesh(dashGeometry, markingMaterial);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(x, 0.03, 0);
            this.sceneManager.add(dash);
        }
    }

    createRoadEdges(roadWidth, groundSize) {
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            roughness: 0.5,
            emissive: 0xffff00,
            emissiveIntensity: 0.05
        });

        const edgeWidth = 0.15;
        const halfRoad = roadWidth / 2 - 0.3;

        [-halfRoad, halfRoad].forEach(offset => {
            const edgeGeometry = new THREE.PlaneGeometry(edgeWidth, groundSize * 0.9);
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.rotation.x = -Math.PI / 2;
            edge.position.set(offset, 0.03, 0);
            this.sceneManager.add(edge);
        });

        [-halfRoad, halfRoad].forEach(offset => {
            const edgeGeometry = new THREE.PlaneGeometry(groundSize * 0.9, edgeWidth);
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.rotation.x = -Math.PI / 2;
            edge.position.set(0, 0.03, offset);
            this.sceneManager.add(edge);
        });
    }

    createSidewalks() {
        const { groundSize, roadWidth, sidewalkWidth, sidewalkColor } = CONFIG.world;

        const sidewalkMaterial = new THREE.MeshStandardMaterial({
            color: sidewalkColor,
            roughness: 0.8,
            metalness: 0.1
        });

        const sidewalkHeight = 0.15;
        const halfRoad = roadWidth / 2;

        [-1, 1].forEach(side => {
            const sidewalkGeometry = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, groundSize * 0.85);
            const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
            sidewalk.position.set(side * (halfRoad + sidewalkWidth / 2 + 0.1), sidewalkHeight / 2, 0);
            sidewalk.castShadow = true;
            sidewalk.receiveShadow = true;
            this.sceneManager.add(sidewalk);
        });

        [-1, 1].forEach(side => {
            const sidewalkGeometry = new THREE.BoxGeometry(groundSize * 0.85, sidewalkHeight, sidewalkWidth);
            const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
            sidewalk.position.set(0, sidewalkHeight / 2, side * (halfRoad + sidewalkWidth / 2 + 0.1));
            sidewalk.castShadow = true;
            sidewalk.receiveShadow = true;
            this.sceneManager.add(sidewalk);
        });
    }

    createHouses() {
        const { roadWidth, sidewalkWidth, houseColors, roofColors } = CONFIG.world;
        const houseOffset = roadWidth / 2 + sidewalkWidth + 8;

        const housePositions = [];
        
        for (let z = -80; z <= 80; z += 25) {
            if (Math.abs(z) > roadWidth) {
                housePositions.push({ x: houseOffset, z, rotation: -Math.PI / 2 });
                housePositions.push({ x: -houseOffset, z, rotation: Math.PI / 2 });
            }
        }

        for (let x = -80; x <= 80; x += 25) {
            if (Math.abs(x) > roadWidth) {
                housePositions.push({ x, z: houseOffset, rotation: Math.PI });
                housePositions.push({ x, z: -houseOffset, rotation: 0 });
            }
        }

        housePositions.forEach((pos, index) => {
            const houseColor = houseColors[index % houseColors.length];
            const roofColor = roofColors[index % roofColors.length];
            const houseType = index % 3;
            this.createHouse(pos.x, pos.z, pos.rotation, houseColor, roofColor, houseType);
        });
    }

    createHouse(x, z, rotation, wallColor, roofColor, type) {
        const group = new THREE.Group();

        const width = 6 + Math.random() * 2;
        const depth = 5 + Math.random() * 2;
        const height = 4 + Math.random() * 2;

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: wallColor,
            roughness: 0.7,
            metalness: 0.1
        });

        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = height / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);

        const roofMaterial = new THREE.MeshStandardMaterial({
            color: roofColor,
            roughness: 0.6,
            metalness: 0.2
        });

        if (type === 0) {
            const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.75, 3, 4);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = height + 1.5;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            group.add(roof);
        } else if (type === 1) {
            const roofShape = new THREE.Shape();
            roofShape.moveTo(-width / 2 - 0.3, 0);
            roofShape.lineTo(0, 2.5);
            roofShape.lineTo(width / 2 + 0.3, 0);
            roofShape.lineTo(-width / 2 - 0.3, 0);

            const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
                steps: 1,
                depth: depth + 0.6,
                bevelEnabled: false
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, height, -depth / 2 - 0.3);
            roof.castShadow = true;
            group.add(roof);
        } else {
            const roofGeometry = new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = height + 0.15;
            roof.castShadow = true;
            group.add(roof);
        }

        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.8
        });
        const doorGeometry = new THREE.BoxGeometry(1.2, 2.2, 0.1);
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.1, depth / 2 + 0.05);
        group.add(door);

        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            roughness: 0.2,
            metalness: 0.5,
            emissive: 0xffffcc,
            emissiveIntensity: 0.1
        });

        const windowPositions = [
            { x: -width / 3, y: height * 0.6, z: depth / 2 + 0.05 },
            { x: width / 3, y: height * 0.6, z: depth / 2 + 0.05 }
        ];

        windowPositions.forEach(pos => {
            const windowGeometry = new THREE.BoxGeometry(1, 1.2, 0.1);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(pos.x, pos.y, pos.z);
            group.add(windowMesh);

            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
            const frameGeometry = new THREE.BoxGeometry(1.1, 0.08, 0.12);
            const frameTop = new THREE.Mesh(frameGeometry, frameMaterial);
            frameTop.position.set(pos.x, pos.y + 0.6, pos.z);
            group.add(frameTop);
            const frameBottom = frameTop.clone();
            frameBottom.position.y = pos.y - 0.6;
            group.add(frameBottom);
        });

        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        this.sceneManager.add(group);

        const houseBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2 + 2, depth / 2))
        });
        houseBody.position.set(x, height / 2 + 2, z);
        houseBody.quaternion.setFromEuler(0, rotation, 0);
        this.physicsManager.getWorld().addBody(houseBody);
    }

    createStreetLights() {
        const { roadWidth, groundSize } = CONFIG.world;
        const lightOffset = roadWidth / 2 + 1.5;

        for (let z = -100; z <= 100; z += 30) {
            this.createStreetLight(lightOffset, z);
            this.createStreetLight(-lightOffset, z);
        }

        for (let x = -100; x <= 100; x += 30) {
            if (Math.abs(x) > roadWidth) {
                this.createStreetLight(x, lightOffset);
                this.createStreetLight(x, -lightOffset);
            }
        }
    }

    createStreetLight(x, z) {
        const group = new THREE.Group();

        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });

        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 6, 8);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 3;
        pole.castShadow = true;
        group.add(pole);

        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const arm = new THREE.Mesh(armGeometry, poleMaterial);
        arm.position.set(0.6, 5.8, 0);
        arm.rotation.z = Math.PI / 2;
        group.add(arm);

        const lampGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(1.2, 5.6, 0);
        group.add(lamp);

        group.position.set(x, 0, z);
        this.sceneManager.add(group);
        this.streetLights.push({ group, lamp });
    }

    createInteractiveObjects() {
        const { interactiveObjects } = CONFIG.world;

        Object.entries(interactiveObjects).forEach(([name, config]) => {
            this.createInteractiveObject(name, config.position, config.color);
        });
    }

    createInteractiveObject(name, position, color) {
        const group = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(2.5, 3, 0.6, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.4,
            metalness: 0.4
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.3;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const pillarGeometry = new THREE.CylinderGeometry(0.25, 0.35, 5, 16);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.5,
            metalness: 0.3
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.y = 3.1;
        pillar.castShadow = true;
        group.add(pillar);

        const signGeometry = new THREE.BoxGeometry(3.5, 1.8, 0.25);
        const signMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.2,
            metalness: 0.6,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = 6;
        sign.castShadow = true;
        group.add(sign);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.toUpperCase(), 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const textGeometry = new THREE.PlaneGeometry(3.2, 1.6);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.y = 6;
        textMesh.position.z = 0.13;
        group.add(textMesh);

        const textMeshBack = textMesh.clone();
        textMeshBack.rotation.y = Math.PI;
        textMeshBack.position.z = -0.13;
        group.add(textMeshBack);

        const glowGeometry = new THREE.SphereGeometry(0.6, 20, 20);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.9
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 7.5;
        group.add(glow);

        group.position.set(position.x, position.y, position.z);
        this.sceneManager.add(group);

        const body = this.physicsManager.createCylinder(3, 3, 8, position, 0);
        body.position.y = 4;
        this.physicsManager.getWorld().addBody(body);

        this.interactiveObjects.push({
            name,
            group,
            body,
            position: new THREE.Vector3(position.x, position.y, position.z),
            glow
        });
    }

    createTrees() {
        const { roadWidth, sidewalkWidth } = CONFIG.world;
        const treeOffset = roadWidth / 2 + sidewalkWidth + 3;

        const treePositions = [];

        for (let z = -90; z <= 90; z += 15) {
            if (Math.abs(z) > roadWidth + 5) {
                treePositions.push({ x: treeOffset + 15, z: z + (Math.random() - 0.5) * 5 });
                treePositions.push({ x: -treeOffset - 15, z: z + (Math.random() - 0.5) * 5 });
            }
        }

        for (let x = -90; x <= 90; x += 15) {
            if (Math.abs(x) > roadWidth + 5) {
                treePositions.push({ x: x + (Math.random() - 0.5) * 5, z: treeOffset + 15 });
                treePositions.push({ x: x + (Math.random() - 0.5) * 5, z: -treeOffset - 15 });
            }
        }

        treePositions.push(
            { x: 60, z: 60 }, { x: -60, z: 60 }, { x: 60, z: -60 }, { x: -60, z: -60 },
            { x: 80, z: 0 }, { x: -80, z: 0 }, { x: 0, z: 80 }, { x: 0, z: -80 }
        );

        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });
    }

    createTree(x, z) {
        const group = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.4, 2.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x5d4037,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        group.add(trunk);

        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            roughness: 0.8
        });

        const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.5, 8), foliageMaterial);
        foliage1.position.y = 4;
        foliage1.castShadow = true;
        group.add(foliage1);

        const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3, 8), foliageMaterial);
        foliage2.position.y = 6;
        foliage2.castShadow = true;
        group.add(foliage2);

        const foliage3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 8), foliageMaterial);
        foliage3.position.y = 7.8;
        foliage3.castShadow = true;
        group.add(foliage3);

        group.position.set(x, 0, z);
        const scale = 0.7 + Math.random() * 0.5;
        group.scale.set(scale, scale, scale);
        this.sceneManager.add(group);
    }

    createClouds() {
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1,
            metalness: 0,
            transparent: true,
            opacity: 0.9
        });

        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Group();
            
            const numSpheres = 4 + Math.floor(Math.random() * 4);
            for (let j = 0; j < numSpheres; j++) {
                const sphereGeometry = new THREE.SphereGeometry(
                    2.5 + Math.random() * 3,
                    12,
                    12
                );
                const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
                sphere.position.set(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 6
                );
                cloud.add(sphere);
            }

            cloud.position.set(
                (Math.random() - 0.5) * 250,
                40 + Math.random() * 30,
                (Math.random() - 0.5) * 250
            );
            
            this.sceneManager.add(cloud);
        }
    }

    createBoundaries() {
        const size = CONFIG.world.groundSize / 2;
        const wallHeight = 8;
        const wallThickness = 2;

        const positions = [
            { x: 0, z: size, rx: 0, ry: 0 },
            { x: 0, z: -size, rx: 0, ry: 0 },
            { x: size, z: 0, rx: 0, ry: Math.PI / 2 },
            { x: -size, z: 0, rx: 0, ry: Math.PI / 2 }
        ];

        positions.forEach(pos => {
            const wallBody = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(size, wallHeight, wallThickness / 2))
            });
            wallBody.position.set(pos.x, wallHeight, pos.z);
            wallBody.quaternion.setFromEuler(pos.rx, pos.ry, 0);
            this.physicsManager.getWorld().addBody(wallBody);
        });
    }

    update(deltaTime, carPosition) {
        this.interactiveObjects.forEach(obj => {
            obj.glow.rotation.y += deltaTime * 2;
            obj.glow.position.y = 7.5 + Math.sin(Date.now() * 0.003) * 0.25;
        });
    }

    getInteractiveObjects() {
        return this.interactiveObjects;
    }

    checkInteraction(carPosition) {
        const interactionDistance = CONFIG.ui.interactionDistance;
        
        for (const obj of this.interactiveObjects) {
            const distance = carPosition.distanceTo(
                new THREE.Vector3(obj.position.x, carPosition.y, obj.position.z)
            );
            
            if (distance < interactionDistance) {
                return obj.name;
            }
        }
        
        return null;
    }
}

export default World;
