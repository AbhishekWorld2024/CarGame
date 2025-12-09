/**
 * World Component - Creates the 3D environment with ground, ramps, obstacles, and interactive objects
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
        
        this.init();
    }

    init() {
        this.createGround();
        this.createRoads();
        this.createRamps();
        this.createObstacles();
        this.createInteractiveObjects();
        this.createDecorations();
        this.createBoundaries();
    }

    createGround() {
        const { groundSize, groundColor } = CONFIG.world;

        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: groundColor,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] += (Math.random() - 0.5) * 0.1;
        }
        groundGeometry.computeVertexNormals();
        
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
            roughness: 0.9,
            metalness: 0.1
        });

        const mainRoadGeometry = new THREE.PlaneGeometry(roadWidth, groundSize * 0.8);
        const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
        mainRoad.rotation.x = -Math.PI / 2;
        mainRoad.position.y = 0.01;
        mainRoad.receiveShadow = true;
        this.sceneManager.add(mainRoad);

        const crossRoadGeometry = new THREE.PlaneGeometry(groundSize * 0.8, roadWidth);
        const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial);
        crossRoad.rotation.x = -Math.PI / 2;
        crossRoad.position.y = 0.01;
        crossRoad.receiveShadow = true;
        this.sceneManager.add(crossRoad);

        this.createRoadMarkings(roadWidth, groundSize);
    }

    createRoadMarkings(roadWidth, groundSize) {
        const markingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5
        });

        const dashLength = 3;
        const dashGap = 2;
        const dashWidth = 0.3;

        for (let z = -groundSize * 0.35; z < groundSize * 0.35; z += dashLength + dashGap) {
            const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
            const dash = new THREE.Mesh(dashGeometry, markingMaterial);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(0, 0.02, z);
            this.sceneManager.add(dash);
        }

        for (let x = -groundSize * 0.35; x < groundSize * 0.35; x += dashLength + dashGap) {
            const dashGeometry = new THREE.PlaneGeometry(dashLength, dashWidth);
            const dash = new THREE.Mesh(dashGeometry, markingMaterial);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(x, 0.02, 0);
            this.sceneManager.add(dash);
        }
    }

    createRamps() {
        const { rampHeight, rampLength, rampWidth } = CONFIG.world;

        const rampPositions = [
            { x: 25, z: 0, rotation: 0 },
            { x: -25, z: 0, rotation: Math.PI },
            { x: 0, z: 25, rotation: -Math.PI / 2 },
            { x: 0, z: -25, rotation: Math.PI / 2 }
        ];

        rampPositions.forEach(pos => {
            this.createRamp(pos.x, pos.z, pos.rotation, rampWidth, rampLength, rampHeight);
        });
    }

    createRamp(x, z, rotation, width, length, height) {
        const rampShape = new THREE.Shape();
        rampShape.moveTo(0, 0);
        rampShape.lineTo(length, 0);
        rampShape.lineTo(length, height);
        rampShape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: width,
            bevelEnabled: false
        };

        const rampGeometry = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
        const rampMaterial = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.7,
            metalness: 0.2
        });

        const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
        rampMesh.rotation.y = rotation;
        rampMesh.rotation.x = -Math.PI / 2;
        rampMesh.position.set(x, 0, z);
        rampMesh.position.x -= Math.cos(rotation) * length / 2;
        rampMesh.position.z -= Math.sin(rotation) * length / 2;
        rampMesh.castShadow = true;
        rampMesh.receiveShadow = true;
        this.sceneManager.add(rampMesh);

        const angle = Math.atan2(height, length);
        const rampBodyLength = Math.sqrt(length * length + height * height);
        
        const rampShape2 = new CANNON.Box(new CANNON.Vec3(rampBodyLength / 2, 0.1, width / 2));
        const rampBody = new CANNON.Body({
            mass: 0,
            shape: rampShape2
        });
        
        rampBody.position.set(x, height / 2, z);
        rampBody.quaternion.setFromEuler(0, rotation, -angle);
        this.physicsManager.getWorld().addBody(rampBody);
    }

    createObstacles() {
        const { obstacleColors } = CONFIG.world;

        const boxPositions = [
            { x: 10, z: -10, size: 1.5 },
            { x: -10, z: -10, size: 1.2 },
            { x: 12, z: 8, size: 1.8 },
            { x: -12, z: 8, size: 1.3 },
            { x: 20, z: 20, size: 1.5 },
            { x: -20, z: 20, size: 1.4 },
            { x: 20, z: -20, size: 1.6 },
            { x: -20, z: -20, size: 1.2 }
        ];

        boxPositions.forEach((pos, index) => {
            const color = obstacleColors[index % obstacleColors.length];
            this.createPushableBox(pos.x, pos.z, pos.size, color);
        });
    }

    createPushableBox(x, z, size, color) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, size / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.sceneManager.add(mesh);

        const body = this.physicsManager.createBox(
            { x: size, y: size, z: size },
            { x, y: size / 2, z },
            size * 10
        );
        
        this.physicsManager.addBody(body, mesh);
        this.pushableObjects.push({ mesh, body });
    }

    createInteractiveObjects() {
        const { interactiveObjects } = CONFIG.world;

        Object.entries(interactiveObjects).forEach(([name, config]) => {
            this.createInteractiveObject(name, config.position, config.color);
        });
    }

    createInteractiveObject(name, position, color) {
        const group = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.5,
            metalness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.6,
            metalness: 0.2
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.y = 2.5;
        pillar.castShadow = true;
        group.add(pillar);

        const signGeometry = new THREE.BoxGeometry(3, 1.5, 0.2);
        const signMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.3,
            metalness: 0.5,
            emissive: color,
            emissiveIntensity: 0.2
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = 5;
        sign.castShadow = true;
        group.add(sign);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.toUpperCase(), 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const textGeometry = new THREE.PlaneGeometry(2.8, 1.4);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.y = 5;
        textMesh.position.z = 0.11;
        group.add(textMesh);

        const textMeshBack = textMesh.clone();
        textMeshBack.rotation.y = Math.PI;
        textMeshBack.position.z = -0.11;
        group.add(textMeshBack);

        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 6.5;
        group.add(glow);

        group.position.set(position.x, position.y, position.z);
        this.sceneManager.add(group);

        const body = this.physicsManager.createCylinder(2.5, 2.5, 7, position, 0);
        body.position.y = 3.5;
        this.physicsManager.getWorld().addBody(body);

        this.interactiveObjects.push({
            name,
            group,
            body,
            position: new THREE.Vector3(position.x, position.y, position.z),
            glow
        });
    }

    createDecorations() {
        const treePositions = [
            { x: 35, z: 35 }, { x: -35, z: 35 }, { x: 35, z: -35 }, { x: -35, z: -35 },
            { x: 40, z: 0 }, { x: -40, z: 0 }, { x: 0, z: 40 }, { x: 0, z: -40 },
            { x: 30, z: 15 }, { x: -30, z: 15 }, { x: 30, z: -15 }, { x: -30, z: -15 }
        ];

        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });

        this.createClouds();
    }

    createTree(x, z) {
        const group = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        group.add(trunk);

        const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x228b22,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 4;
        foliage.castShadow = true;
        group.add(foliage);

        const topFoliage = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 3, 8),
            foliageMaterial
        );
        topFoliage.position.y = 6;
        topFoliage.castShadow = true;
        group.add(topFoliage);

        group.position.set(x, 0, z);
        const scale = 0.8 + Math.random() * 0.4;
        group.scale.set(scale, scale, scale);
        this.sceneManager.add(group);
    }

    createClouds() {
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1,
            metalness: 0
        });

        for (let i = 0; i < 10; i++) {
            const cloud = new THREE.Group();
            
            const numSpheres = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numSpheres; j++) {
                const sphereGeometry = new THREE.SphereGeometry(
                    2 + Math.random() * 2,
                    16,
                    16
                );
                const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
                sphere.position.set(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 4
                );
                cloud.add(sphere);
            }

            cloud.position.set(
                (Math.random() - 0.5) * 150,
                30 + Math.random() * 20,
                (Math.random() - 0.5) * 150
            );
            
            this.sceneManager.add(cloud);
        }
    }

    createBoundaries() {
        const size = CONFIG.world.groundSize / 2;
        const wallHeight = 5;
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
            obj.glow.position.y = 6.5 + Math.sin(Date.now() * 0.003) * 0.2;
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
