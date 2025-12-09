/**
 * Car Component - 3D car model with physics using cannon-es RaycastVehicle
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CONFIG from '../utils/config.js';

export class Car {
    constructor(physicsManager, sceneManager) {
        this.physicsManager = physicsManager;
        this.sceneManager = sceneManager;
        
        this.chassisBody = null;
        this.vehicle = null;
        this.chassisMesh = null;
        this.wheelMeshes = [];
        
        this.currentSpeed = 0;
        this.steering = 0;
        
        this.init();
    }

    init() {
        this.createChassis();
        this.createVehicle();
        this.createVisuals();
    }

    createChassis() {
        const { chassisWidth, chassisHeight, chassisLength, chassisMass } = CONFIG.car;
        
        const chassisShape = new CANNON.Box(new CANNON.Vec3(
            chassisWidth / 2,
            chassisHeight / 2,
            chassisLength / 2
        ));
        
        this.chassisBody = new CANNON.Body({
            mass: chassisMass,
            position: new CANNON.Vec3(0, 2, 0),
            shape: chassisShape,
            angularDamping: 0.4
        });
        
        this.physicsManager.getWorld().addBody(this.chassisBody);
    }

    createVehicle() {
        const {
            wheelRadius,
            wheelFriction,
            wheelSuspensionStiffness,
            wheelSuspensionDamping,
            wheelSuspensionCompression,
            wheelSuspensionRestLength,
            wheelRollInfluence,
            chassisWidth,
            chassisLength
        } = CONFIG.car;

        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });

        const wheelOptions = {
            radius: wheelRadius,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: wheelSuspensionStiffness,
            suspensionRestLength: wheelSuspensionRestLength,
            frictionSlip: wheelFriction,
            dampingRelaxation: wheelSuspensionDamping,
            dampingCompression: wheelSuspensionCompression,
            maxSuspensionForce: 100000,
            rollInfluence: wheelRollInfluence,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        const wheelPositions = [
            { x: -chassisWidth / 2 - 0.1, y: 0, z: chassisLength / 2 - 0.5 },
            { x: chassisWidth / 2 + 0.1, y: 0, z: chassisLength / 2 - 0.5 },
            { x: -chassisWidth / 2 - 0.1, y: 0, z: -chassisLength / 2 + 0.5 },
            { x: chassisWidth / 2 + 0.1, y: 0, z: -chassisLength / 2 + 0.5 }
        ];

        wheelPositions.forEach((pos, index) => {
            wheelOptions.chassisConnectionPointLocal.set(pos.x, pos.y, pos.z);
            wheelOptions.isFrontWheel = index < 2;
            this.vehicle.addWheel(wheelOptions);
        });

        this.vehicle.addToWorld(this.physicsManager.getWorld());
    }

    createVisuals() {
        const { colors, chassisWidth, chassisHeight, chassisLength, wheelRadius, wheelWidth } = CONFIG.car;

        const carGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: colors.body,
            metalness: 0.6,
            roughness: 0.4
        });
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        carGroup.add(bodyMesh);

        const cabinGeometry = new THREE.BoxGeometry(chassisWidth * 0.8, chassisHeight * 0.7, chassisLength * 0.4);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: colors.cabin,
            metalness: 0.3,
            roughness: 0.5
        });
        const cabinMesh = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabinMesh.position.set(0, chassisHeight * 0.6, -chassisLength * 0.1);
        cabinMesh.castShadow = true;
        carGroup.add(cabinMesh);

        const frontBumperGeometry = new THREE.BoxGeometry(chassisWidth * 1.05, chassisHeight * 0.3, 0.3);
        const bumperMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.5
        });
        const frontBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        frontBumper.position.set(0, -chassisHeight * 0.2, chassisLength / 2 + 0.1);
        frontBumper.castShadow = true;
        carGroup.add(frontBumper);

        const rearBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        rearBumper.position.set(0, -chassisHeight * 0.2, -chassisLength / 2 - 0.1);
        rearBumper.castShadow = true;
        carGroup.add(rearBumper);

        const headlightGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.05);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: colors.lights,
            emissive: colors.lights,
            emissiveIntensity: 0.5
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-chassisWidth / 3, 0, chassisLength / 2 + 0.02);
        carGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(chassisWidth / 3, 0, chassisLength / 2 + 0.02);
        carGroup.add(rightHeadlight);

        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: colors.taillights,
            emissive: colors.taillights,
            emissiveIntensity: 0.3
        });
        
        const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        leftTaillight.position.set(-chassisWidth / 3, 0, -chassisLength / 2 - 0.02);
        carGroup.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        rightTaillight.position.set(chassisWidth / 3, 0, -chassisLength / 2 - 0.02);
        carGroup.add(rightTaillight);

        this.chassisMesh = carGroup;
        this.sceneManager.add(carGroup);

        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
        wheelGeometry.rotateZ(Math.PI / 2);
        
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: colors.wheels,
            metalness: 0.3,
            roughness: 0.7
        });

        for (let i = 0; i < 4; i++) {
            const wheelMesh = new THREE.Group();
            
            const tire = new THREE.Mesh(wheelGeometry, wheelMaterial);
            tire.castShadow = true;
            wheelMesh.add(tire);
            
            const hubGeometry = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 16);
            hubGeometry.rotateZ(Math.PI / 2);
            const hubMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.8,
                roughness: 0.2
            });
            const hub = new THREE.Mesh(hubGeometry, hubMaterial);
            wheelMesh.add(hub);
            
            this.wheelMeshes.push(wheelMesh);
            this.sceneManager.add(wheelMesh);
        }
    }

    update(controls) {
        const { maxForce, maxBrakeForce, maxSteerAngle, steerSpeed, steerReturnSpeed } = CONFIG.car;

        let engineForce = 0;
        let brakeForce = 0;

        if (controls.forward) {
            engineForce = maxForce;
        }
        if (controls.backward) {
            engineForce = -maxForce * 0.5;
        }
        if (controls.brake) {
            brakeForce = maxBrakeForce;
        }

        if (controls.left) {
            this.steering = Math.min(this.steering + steerSpeed, maxSteerAngle);
        } else if (controls.right) {
            this.steering = Math.max(this.steering - steerSpeed, -maxSteerAngle);
        } else {
            if (this.steering > 0) {
                this.steering = Math.max(this.steering - steerReturnSpeed, 0);
            } else if (this.steering < 0) {
                this.steering = Math.min(this.steering + steerReturnSpeed, 0);
            }
        }

        this.vehicle.setSteeringValue(this.steering, 0);
        this.vehicle.setSteeringValue(this.steering, 1);

        this.vehicle.applyEngineForce(engineForce, 2);
        this.vehicle.applyEngineForce(engineForce, 3);

        this.vehicle.setBrake(brakeForce, 0);
        this.vehicle.setBrake(brakeForce, 1);
        this.vehicle.setBrake(brakeForce, 2);
        this.vehicle.setBrake(brakeForce, 3);

        this.updateVisuals();
        this.calculateSpeed();
    }

    updateVisuals() {
        if (this.chassisMesh) {
            this.chassisMesh.position.copy(this.chassisBody.position);
            this.chassisMesh.quaternion.copy(this.chassisBody.quaternion);
        }

        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            this.vehicle.updateWheelTransform(i);
            const wheelInfo = this.vehicle.wheelInfos[i];
            const wheelMesh = this.wheelMeshes[i];
            
            if (wheelMesh) {
                wheelMesh.position.copy(wheelInfo.worldTransform.position);
                wheelMesh.quaternion.copy(wheelInfo.worldTransform.quaternion);
            }
        }
    }

    calculateSpeed() {
        const velocity = this.chassisBody.velocity;
        this.currentSpeed = Math.sqrt(
            velocity.x * velocity.x +
            velocity.y * velocity.y +
            velocity.z * velocity.z
        ) * 3.6;
    }

    getSpeed() {
        return Math.round(this.currentSpeed);
    }

    getPosition() {
        return this.chassisBody.position;
    }

    getMesh() {
        return this.chassisMesh;
    }

    reset() {
        this.chassisBody.position.set(0, 2, 0);
        this.chassisBody.velocity.set(0, 0, 0);
        this.chassisBody.angularVelocity.set(0, 0, 0);
        this.chassisBody.quaternion.set(0, 0, 0, 1);
        this.steering = 0;
    }
}

export default Car;
