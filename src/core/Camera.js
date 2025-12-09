/**
 * Camera Controller - Third-person follow camera with smooth damping
 */

import * as THREE from 'three';
import CONFIG from '../utils/config.js';

export class CameraController {
    constructor() {
        this.camera = null;
        this.target = null;
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        
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

        const { followDistance, followHeight, lookAtHeight, smoothness } = CONFIG.camera;

        const targetPosition = this.target.position.clone();
        const targetRotation = this.target.quaternion.clone();

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(targetRotation);

        const idealPosition = new THREE.Vector3();
        idealPosition.copy(targetPosition);
        idealPosition.x -= forward.x * followDistance;
        idealPosition.z -= forward.z * followDistance;
        idealPosition.y = targetPosition.y + followHeight;

        const idealLookAt = new THREE.Vector3();
        idealLookAt.copy(targetPosition);
        idealLookAt.y += lookAtHeight;

        this.currentPosition.lerp(idealPosition, smoothness);
        this.currentLookAt.lerp(idealLookAt, smoothness);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }

    getCamera() {
        return this.camera;
    }

    getPosition() {
        return this.camera.position;
    }
}

export default CameraController;
