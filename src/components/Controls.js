/**
 * Controls Manager - Handles keyboard and mobile touch controls
 */

import CONFIG from '../utils/config.js';

export class Controls {
    constructor() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.brake = false;
        this.interact = false;
        
        this.isMobile = this.checkMobile();
        this.joystickActive = false;
        this.joystickAngle = 0;
        this.joystickDistance = 0;
        
        this.init();
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    init() {
        this.setupKeyboardControls();
        
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        window.addEventListener('resize', () => {
            this.isMobile = this.checkMobile();
            if (this.isMobile) {
                this.setupMobileControls();
            }
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.right = true;
                break;
            case 'Space':
                this.brake = true;
                this.interact = true;
                break;
            case 'KeyR':
                this.reset = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.right = false;
                break;
            case 'Space':
                this.brake = false;
                this.interact = false;
                break;
            case 'KeyR':
                this.reset = false;
                break;
        }
    }

    setupMobileControls() {
        const joystickContainer = document.getElementById('joystick');
        const joystickStick = document.querySelector('.joystick-stick');
        const brakeBtn = document.getElementById('brake-btn');
        
        if (!joystickContainer || !joystickStick) return;

        const joystickBase = joystickContainer.querySelector('.joystick-base');
        const baseRect = joystickBase.getBoundingClientRect();
        const centerX = baseRect.width / 2;
        const centerY = baseRect.height / 2;
        const maxDistance = CONFIG.mobile.joystickMaxDistance;
        const deadzone = CONFIG.mobile.joystickDeadzone;

        const handleJoystickMove = (clientX, clientY) => {
            const rect = joystickBase.getBoundingClientRect();
            const x = clientX - rect.left - centerX;
            const y = clientY - rect.top - centerY;
            
            const distance = Math.min(Math.sqrt(x * x + y * y), maxDistance);
            const angle = Math.atan2(y, x);
            
            this.joystickDistance = distance;
            this.joystickAngle = angle;
            
            const stickX = Math.cos(angle) * distance;
            const stickY = Math.sin(angle) * distance;
            
            joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
            
            if (distance > deadzone) {
                const normalizedX = stickX / maxDistance;
                const normalizedY = stickY / maxDistance;
                
                this.forward = normalizedY < -0.3;
                this.backward = normalizedY > 0.3;
                this.left = normalizedX < -0.3;
                this.right = normalizedX > 0.3;
            } else {
                this.forward = false;
                this.backward = false;
                this.left = false;
                this.right = false;
            }
        };

        const resetJoystick = () => {
            this.joystickActive = false;
            this.joystickDistance = 0;
            joystickStick.style.transform = 'translate(0, 0)';
            this.forward = false;
            this.backward = false;
            this.left = false;
            this.right = false;
        };

        joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            const touch = e.touches[0];
            handleJoystickMove(touch.clientX, touch.clientY);
        });

        joystickContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystickActive) {
                const touch = e.touches[0];
                handleJoystickMove(touch.clientX, touch.clientY);
            }
        });

        joystickContainer.addEventListener('touchend', resetJoystick);
        joystickContainer.addEventListener('touchcancel', resetJoystick);

        if (brakeBtn) {
            brakeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.brake = true;
                this.interact = true;
            });
            
            brakeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.brake = false;
                this.interact = false;
            });
        }
    }

    getControls() {
        return {
            forward: this.forward,
            backward: this.backward,
            left: this.left,
            right: this.right,
            brake: this.brake,
            interact: this.interact,
            reset: this.reset
        };
    }

    isInteracting() {
        return this.interact;
    }

    shouldReset() {
        const reset = this.reset;
        this.reset = false;
        return reset;
    }

    isMobileDevice() {
        return this.isMobile;
    }
}

export default Controls;
