/**
 * UI Manager - Handles all UI elements, panels, and HUD
 */

import CONFIG from '../utils/config.js';

export class UIManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgressBar = document.querySelector('.loader-progress-bar');
        this.panelOverlay = document.getElementById('panel-overlay');
        this.interactionHint = document.getElementById('interaction-hint');
        this.speedValue = document.querySelector('.speed-value');
        this.soundToggle = document.getElementById('sound-toggle');
        this.mobileControls = document.getElementById('mobile-controls');
        this.webglError = document.getElementById('webgl-error');
        
        this.panels = {
            about: document.getElementById('about-panel'),
            projects: document.getElementById('projects-panel'),
            contact: document.getElementById('contact-panel')
        };
        
        this.currentPanel = null;
        this.isMuted = false;
        this.nearInteractive = null;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPanelClose();
        this.setupSoundToggle();
        this.setupKeyboardShortcuts();
        this.checkMobile();
        
        window.addEventListener('resize', () => this.checkMobile());
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.showPanel(section);
            });
        });
    }

    setupPanelClose() {
        const closeBtn = document.querySelector('.panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }
        
        this.panelOverlay.addEventListener('click', (e) => {
            if (e.target === this.panelOverlay) {
                this.hidePanel();
            }
        });
    }

    setupSoundToggle() {
        if (this.soundToggle) {
            this.soundToggle.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                this.soundToggle.classList.toggle('muted', this.isMuted);
                this.onSoundToggle(this.isMuted);
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.hidePanel();
            }
        });
    }

    checkMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        (window.innerWidth <= 768);
        
        if (this.mobileControls) {
            this.mobileControls.style.display = isMobile ? 'block' : 'none';
        }
    }

    setLoadingProgress(progress) {
        if (this.loadingProgressBar) {
            this.loadingProgressBar.style.width = `${progress}%`;
        }
    }

    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    }

    showWebGLError() {
        if (this.webglError) {
            this.webglError.classList.remove('hidden');
        }
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    }

    showPanel(panelName) {
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.classList.remove('active');
        });
        
        if (this.panels[panelName]) {
            this.panels[panelName].classList.add('active');
            this.panelOverlay.classList.remove('hidden');
            this.currentPanel = panelName;
        }
    }

    hidePanel() {
        this.panelOverlay.classList.add('hidden');
        this.currentPanel = null;
    }

    isPanelOpen() {
        return this.currentPanel !== null;
    }

    updateSpeed(speed) {
        if (this.speedValue) {
            this.speedValue.textContent = speed;
        }
    }

    showInteractionHint(objectName) {
        if (this.interactionHint && objectName !== this.nearInteractive) {
            this.nearInteractive = objectName;
            this.interactionHint.classList.remove('hidden');
            
            const hintText = this.interactionHint.querySelector('.hint-text');
            if (hintText) {
                hintText.textContent = `Press SPACE to view ${objectName.charAt(0).toUpperCase() + objectName.slice(1)}`;
            }
        }
    }

    hideInteractionHint() {
        if (this.interactionHint) {
            this.interactionHint.classList.add('hidden');
            this.nearInteractive = null;
        }
    }

    getNearInteractive() {
        return this.nearInteractive;
    }

    onSoundToggle(muted) {
    }

    setSoundToggleCallback(callback) {
        this.onSoundToggle = callback;
    }
}

export default UIManager;
