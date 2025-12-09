/**
 * 3D Car Experience - Main Entry Point
 * 
 * An interactive 3D car driving experience website inspired by bruno-simon.com
 * 
 * HOW TO RUN:
 * 1. npm install
 * 2. npm run dev
 * 3. Open http://localhost:5173 in your browser
 * 
 * CONTROLS:
 * - W / Up Arrow: Accelerate
 * - S / Down Arrow: Brake / Reverse
 * - A / Left Arrow: Turn left
 * - D / Right Arrow: Turn right
 * - Space: Brake / Interact with objects
 * - R: Reset car position
 * 
 * On mobile: Use the on-screen joystick and brake button
 */

import * as THREE from 'three';
import { SceneManager } from './core/Scene.js';
import { CameraController } from './core/Camera.js';
import { PhysicsManager } from './core/Physics.js';
import { Car } from './components/Car.js';
import { World } from './components/World.js';
import { Controls } from './components/Controls.js';
import { UIManager } from './components/UI.js';
import CONFIG from './utils/config.js';

class Game {
    constructor() {
        this.isRunning = false;
        this.clock = new THREE.Clock();
        this.lastInteraction = null;
        
        this.sceneManager = null;
        this.cameraController = null;
        this.physicsManager = null;
        this.car = null;
        this.world = null;
        this.controls = null;
        this.ui = null;
        
        this.init();
    }

    async init() {
        if (!this.checkWebGL()) {
            return;
        }

        this.ui = new UIManager();
        this.ui.setLoadingProgress(10);

        await this.loadAssets();
        
        this.ui.setLoadingProgress(30);

        this.setupScene();
        this.ui.setLoadingProgress(50);

        this.setupPhysics();
        this.ui.setLoadingProgress(60);

        this.setupWorld();
        this.ui.setLoadingProgress(70);

        this.setupCar();
        this.ui.setLoadingProgress(80);

        this.setupControls();
        this.ui.setLoadingProgress(90);

        this.setupCamera();
        this.ui.setLoadingProgress(100);

        setTimeout(() => {
            this.ui.hideLoading();
            this.start();
        }, CONFIG.ui.loadingDuration);
    }

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                throw new Error('WebGL not supported');
            }
            return true;
        } catch (e) {
            console.error('WebGL not supported:', e);
            const ui = new UIManager();
            ui.showWebGLError();
            return false;
        }
    }

    async loadAssets() {
        return new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }

    setupScene() {
        const canvas = document.getElementById('webgl-canvas');
        this.sceneManager = new SceneManager(canvas);
    }

    setupPhysics() {
        this.physicsManager = new PhysicsManager();
    }

    setupWorld() {
        this.world = new World(this.physicsManager, this.sceneManager);
    }

    setupCar() {
        this.car = new Car(this.physicsManager, this.sceneManager);
    }

    setupControls() {
        this.controls = new Controls();
    }

    setupCamera() {
        this.cameraController = new CameraController();
        this.cameraController.setTarget(this.car.getMesh());
        this.sceneManager.setCamera(this.cameraController.getCamera());
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        if (!this.ui.isPanelOpen()) {
            this.update(deltaTime);
        }

        this.render();
    }

    update(deltaTime) {
        const controlState = this.controls.getControls();

        if (this.controls.shouldReset()) {
            this.car.reset();
        }

        this.car.update(controlState);

        this.physicsManager.update(deltaTime);

        const carPosition = new THREE.Vector3().copy(this.car.getPosition());
        this.world.update(deltaTime, carPosition);

        this.cameraController.update(deltaTime);

        this.ui.updateSpeed(this.car.getSpeed());

        this.checkInteractions(carPosition, controlState);
    }

    checkInteractions(carPosition, controlState) {
        const nearObject = this.world.checkInteraction(carPosition);
        
        if (nearObject) {
            this.ui.showInteractionHint(nearObject);
            
            if (controlState.interact && nearObject !== this.lastInteraction) {
                this.ui.showPanel(nearObject);
                this.lastInteraction = nearObject;
            }
        } else {
            this.ui.hideInteractionHint();
            this.lastInteraction = null;
        }
    }

    render() {
        this.sceneManager.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
