/**
 * Camera Controller - Third-person follow camera with smooth damping
 * IMPROVED VERSION - Better smoothness, cinematic motion, and no clipping
 */

import * as THREE from 'three';
import CONFIG from '../utils/config.js';

export class CameraController {
    constructor() {
        this.camera = null;
        this.target = null;
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.targetVelocity = new THREE.Vector3();
        
        this.init();
    }

    init() {
        const { fov, near, far } = CONFIG.camera;
        
        this.camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        );
        
        this.camera.position.set(0, 10, 20);
        this.currentPosition.copy(this.camera.position);
        
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    setTarget(target) {
        this.target = target;
    }

    update(deltaTime) {
        if (!this.target) return;

        const { followDistance, followHeight, lookAtHeight, smoothness, minHeight } = CONFIG.camera;

        const targetPosition = this.target.position.clone();
        const targetRotation = this.target.quaternion.clone();

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(targetRotation);

        let dynamicDistance = followDistance;
        let dynamicHeight = followHeight;
        
        if (this.target.velocity) {
            const speed = Math.sqrt(
                this.target.velocity.x * this.target.velocity.x +
                this.target.velocity.z * this.target.velocity.z
            );
            
            const speedFactor = Math.min(speed / 20, 1);
            dynamicDistance = followDistance + speedFactor * 3;
            dynamicHeight = followHeight + speedFactor * 1.5;
        }

        const idealPosition = new THREE.Vector3();
        idealPosition.copy(targetPosition);
        idealPosition.x -= forward.x * dynamicDistance;
        idealPosition.z -= forward.z * dynamicDistance;
        idealPosition.y = Math.max(targetPosition.y + dynamicHeight, minHeight || 3);

        const idealLookAt = new THREE.Vector3();
        idealLookAt.copy(targetPosition);
        idealLookAt.y += lookAtHeight;
        idealLookAt.x += forward.x * 2;
        idealLookAt.z += forward.z * 2;

        const positionSmoothness = smoothness * (deltaTime * 60);
        const lookAtSmoothness = smoothness * 1.5 * (deltaTime * 60);

        this.currentPosition.lerp(idealPosition, Math.min(positionSmoothness, 0.15));
        this.currentLookAt.lerp(idealLookAt, Math.min(lookAtSmoothness, 0.2));

        if (this.currentPosition.y < (minHeight || 3)) {
            this.currentPosition.y = minHeight || 3;
        }

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }

    getCamera() {
        return this.camera;
    }

    getPosition() {
        return this.camera.position;
    }

    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        this.currentPosition.set(x, y, z);
    }
}

export default CameraController;
