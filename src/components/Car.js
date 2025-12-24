/**
 * Car Component - 3D car model with physics using cannon-es RaycastVehicle
 * IMPROVED VERSION - Better physics, handling, and visuals
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
        this.targetSteering = 0;
        
        this.init();
    }

    init() {
        this.createChassis();
        this.createVehicle();
        this.createVisuals();
    }

    createChassis() {
        const { chassisWidth, chassisHeight, chassisLength, chassisMass, linearDamping, angularDamping } = CONFIG.car;
        
        const chassisShape = new CANNON.Box(new CANNON.Vec3(
            chassisWidth / 2,
            chassisHeight / 2,
            chassisLength / 2
        ));
        
        this.chassisBody = new CANNON.Body({
            mass: chassisMass,
            position: new CANNON.Vec3(0, 2, 0),
            shape: chassisShape,
            linearDamping: linearDamping || 0.1,
            angularDamping: angularDamping || 0.5
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
            maxSuspensionForce: 150000,
            rollInfluence: wheelRollInfluence,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            maxSuspensionTravel: 0.4,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        const wheelPositions = [
            { x: -chassisWidth / 2 - 0.15, y: -0.1, z: chassisLength / 2 - 0.6 },
            { x: chassisWidth / 2 + 0.15, y: -0.1, z: chassisLength / 2 - 0.6 },
            { x: -chassisWidth / 2 - 0.15, y: -0.1, z: -chassisLength / 2 + 0.6 },
            { x: chassisWidth / 2 + 0.15, y: -0.1, z: -chassisLength / 2 + 0.6 }
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
            metalness: colors.bodyMetallic || 0.8,
            roughness: 0.3
        });
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        carGroup.add(bodyMesh);

        const hoodGeometry = new THREE.BoxGeometry(chassisWidth * 0.95, chassisHeight * 0.15, chassisLength * 0.35);
        const hoodMesh = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hoodMesh.position.set(0, chassisHeight * 0.55, chassisLength * 0.25);
        hoodMesh.castShadow = true;
        carGroup.add(hoodMesh);

        const cabinGeometry = new THREE.BoxGeometry(chassisWidth * 0.85, chassisHeight * 0.65, chassisLength * 0.38);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: colors.cabin,
            metalness: colors.cabinMetallic || 0.2,
            roughness: 0.1,
            transparent: true,
            opacity: 0.85
        });
        const cabinMesh = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabinMesh.position.set(0, chassisHeight * 0.75, -chassisLength * 0.08);
        cabinMesh.castShadow = true;
        carGroup.add(cabinMesh);

        const roofGeometry = new THREE.BoxGeometry(chassisWidth * 0.8, chassisHeight * 0.1, chassisLength * 0.35);
        const roofMesh = new THREE.Mesh(roofGeometry, bodyMaterial);
        roofMesh.position.set(0, chassisHeight * 1.1, -chassisLength * 0.08);
        roofMesh.castShadow = true;
        carGroup.add(roofMesh);

        const bumperMaterial = new THREE.MeshStandardMaterial({
            color: colors.chrome || 0xc0c0c0,
            metalness: 0.9,
            roughness: 0.1
        });

        const frontBumperGeometry = new THREE.BoxGeometry(chassisWidth * 1.05, chassisHeight * 0.25, 0.25);
        const frontBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        frontBumper.position.set(0, -chassisHeight * 0.25, chassisLength / 2 + 0.12);
        frontBumper.castShadow = true;
        carGroup.add(frontBumper);

        const rearBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        rearBumper.position.set(0, -chassisHeight * 0.25, -chassisLength / 2 - 0.12);
        rearBumper.castShadow = true;
        carGroup.add(rearBumper);

        const grillGeometry = new THREE.BoxGeometry(chassisWidth * 0.6, chassisHeight * 0.3, 0.08);
        const grillMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.5,
            roughness: 0.5
        });
        const grill = new THREE.Mesh(grillGeometry, grillMaterial);
        grill.position.set(0, chassisHeight * 0.1, chassisLength / 2 + 0.04);
        carGroup.add(grill);

        const headlightGeometry = new THREE.BoxGeometry(0.35, 0.2, 0.08);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: colors.lights,
            emissive: colors.lights,
            emissiveIntensity: 0.8
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-chassisWidth / 2.8, chassisHeight * 0.15, chassisLength / 2 + 0.04);
        carGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(chassisWidth / 2.8, chassisHeight * 0.15, chassisLength / 2 + 0.04);
        carGroup.add(rightHeadlight);

        const taillightGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.08);
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: colors.taillights,
            emissive: colors.taillights,
            emissiveIntensity: 0.5
        });
        
        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-chassisWidth / 2.8, chassisHeight * 0.1, -chassisLength / 2 - 0.04);
        carGroup.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(chassisWidth / 2.8, chassisHeight * 0.1, -chassisLength / 2 - 0.04);
        carGroup.add(rightTaillight);

        const mirrorGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.2);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: colors.body,
            metalness: 0.8,
            roughness: 0.3
        });
        
        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(-chassisWidth / 2 - 0.15, chassisHeight * 0.6, chassisLength * 0.1);
        carGroup.add(leftMirror);
        
        const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        rightMirror.position.set(chassisWidth / 2 + 0.15, chassisHeight * 0.6, chassisLength * 0.1);
        carGroup.add(rightMirror);

        this.chassisMesh = carGroup;
        this.sceneManager.add(carGroup);

        const tireGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
        tireGeometry.rotateZ(Math.PI / 2);
        
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: colors.wheels,
            metalness: 0.1,
            roughness: 0.9
        });

        const rimMaterial = new THREE.MeshStandardMaterial({
            color: colors.chrome || 0xc0c0c0,
            metalness: 0.95,
            roughness: 0.05
        });

        for (let i = 0; i < 4; i++) {
            const wheelMesh = new THREE.Group();
            
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.castShadow = true;
            wheelMesh.add(tire);
            
            const rimGeometry = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.02, 20);
            rimGeometry.rotateZ(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            wheelMesh.add(rim);

            const hubCapGeometry = new THREE.CylinderGeometry(wheelRadius * 0.25, wheelRadius * 0.25, wheelWidth + 0.04, 12);
            hubCapGeometry.rotateZ(Math.PI / 2);
            const hubCap = new THREE.Mesh(hubCapGeometry, rimMaterial);
            wheelMesh.add(hubCap);
            
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
            engineForce = -maxForce * 0.6;
        }
        if (controls.brake) {
            brakeForce = maxBrakeForce;
        }

        if (controls.left) {
            this.targetSteering = maxSteerAngle;
        } else if (controls.right) {
            this.targetSteering = -maxSteerAngle;
        } else {
            this.targetSteering = 0;
        }

        const steerLerpSpeed = this.targetSteering !== 0 ? steerSpeed : steerReturnSpeed;
        this.steering += (this.targetSteering - this.steering) * steerLerpSpeed * 2;

        if (Math.abs(this.steering) < 0.001) {
            this.steering = 0;
        }

        this.vehicle.setSteeringValue(this.steering, 0);
        this.vehicle.setSteeringValue(this.steering, 1);

        this.vehicle.applyEngineForce(engineForce, 2);
        this.vehicle.applyEngineForce(engineForce, 3);

        this.vehicle.setBrake(brakeForce, 0);
        this.vehicle.setBrake(brakeForce, 1);
        this.vehicle.setBrake(brakeForce, 2);
        this.vehicle.setBrake(brakeForce, 3);

        this.stabilizeCar();

        this.updateVisuals();
        this.calculateSpeed();
    }

    stabilizeCar() {
        const upVector = new CANNON.Vec3(0, 1, 0);
        const carUp = new CANNON.Vec3();
        this.chassisBody.quaternion.vmult(upVector, carUp);
        
        const dot = carUp.dot(upVector);
        
        if (dot < 0.7) {
            const correctionTorque = new CANNON.Vec3(
                (upVector.x - carUp.x) * 50,
                0,
                (upVector.z - carUp.z) * 50
            );
            this.chassisBody.angularVelocity.x *= 0.95;
            this.chassisBody.angularVelocity.z *= 0.95;
        }
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

    getVelocity() {
        return this.chassisBody.velocity;
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
        this.targetSteering = 0;
    }
}

export default Car;
