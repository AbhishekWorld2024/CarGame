/**
 * Scene Manager - Handles Three.js scene setup, renderer, and post-processing
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import CONFIG from '../utils/config.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.renderer = null;
        this.composer = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createRenderer();
        this.createLights();
        this.setupPostProcessing();
        this.handleResize();
        
        window.addEventListener('resize', () => this.handleResize());
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
        this.scene.fog = new THREE.Fog(
            CONFIG.scene.fogColor,
            CONFIG.scene.fogNear,
            CONFIG.scene.fogFar
        );
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = CONFIG.postProcessing.toneMapping.exposure;
    }

    createLights() {
        const { ambient, directional, hemisphere } = CONFIG.lighting;

        const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(
            hemisphere.skyColor,
            hemisphere.groundColor,
            hemisphere.intensity
        );
        this.scene.add(hemisphereLight);

        const directionalLight = new THREE.DirectionalLight(directional.color, directional.intensity);
        directionalLight.position.set(
            directional.position.x,
            directional.position.y,
            directional.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = directional.shadowMapSize;
        directionalLight.shadow.mapSize.height = directional.shadowMapSize;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -directional.shadowCameraSize;
        directionalLight.shadow.camera.right = directional.shadowCameraSize;
        directionalLight.shadow.camera.top = directional.shadowCameraSize;
        directionalLight.shadow.camera.bottom = -directional.shadowCameraSize;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
    }

    setupPostProcessing() {
        const { bloom } = CONFIG.postProcessing;
        
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, null);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloom.strength,
            bloom.radius,
            bloom.threshold
        );
        this.composer.addPass(bloomPass);
        
        this.renderPass = renderPass;
        this.bloomPass = bloomPass;
    }

    setCamera(camera) {
        this.renderPass.camera = camera;
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        if (this.bloomPass) {
            this.bloomPass.resolution.set(width, height);
        }
    }

    render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.renderPass.camera);
        }
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }
}

export default SceneManager;
