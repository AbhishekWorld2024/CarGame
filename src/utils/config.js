/**
 * Configuration file for 3D Car Experience
 * All tunable parameters are centralized here for easy adjustment
 */

export const CONFIG = {
    // Scene settings
    scene: {
        backgroundColor: 0x87ceeb,
        fogColor: 0x87ceeb,
        fogNear: 50,
        fogFar: 200
    },

    // Camera settings
    camera: {
        fov: 60,
        near: 0.1,
        far: 500,
        followDistance: 8,
        followHeight: 4,
        lookAtHeight: 1,
        smoothness: 0.05
    },

    // Lighting
    lighting: {
        ambient: {
            color: 0xffffff,
            intensity: 0.6
        },
        directional: {
            color: 0xffffff,
            intensity: 1.0,
            position: { x: 50, y: 100, z: 50 },
            shadowMapSize: 2048,
            shadowCameraSize: 100
        },
        hemisphere: {
            skyColor: 0x87ceeb,
            groundColor: 0x444444,
            intensity: 0.4
        }
    },

    // Physics settings
    physics: {
        gravity: -30,
        groundFriction: 0.5,
        groundRestitution: 0.3,
        fixedTimeStep: 1 / 60,
        maxSubSteps: 3
    },

    // Car settings
    car: {
        chassisWidth: 1.8,
        chassisHeight: 0.6,
        chassisLength: 4,
        chassisMass: 150,
        
        wheelRadius: 0.4,
        wheelWidth: 0.3,
        wheelFriction: 5,
        wheelSuspensionStiffness: 30,
        wheelSuspensionDamping: 4.4,
        wheelSuspensionCompression: 4.4,
        wheelSuspensionRestLength: 0.3,
        wheelRollInfluence: 0.01,
        
        maxSteerAngle: 0.5,
        maxForce: 1000,
        maxBrakeForce: 50,
        
        acceleration: 800,
        brakeForce: 30,
        steerSpeed: 0.05,
        steerReturnSpeed: 0.1,
        
        colors: {
            body: 0x6366f1,
            cabin: 0x1e293b,
            wheels: 0x333333,
            lights: 0xffffff,
            taillights: 0xff0000
        }
    },

    // World settings
    world: {
        groundSize: 200,
        groundColor: 0x4ade80,
        roadColor: 0x475569,
        roadWidth: 10,
        
        rampHeight: 3,
        rampLength: 8,
        rampWidth: 6,
        
        obstacleColors: [0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4],
        
        interactiveObjects: {
            about: { position: { x: 15, y: 0, z: 15 }, color: 0x6366f1 },
            projects: { position: { x: -15, y: 0, z: 15 }, color: 0x8b5cf6 },
            contact: { position: { x: 0, y: 0, z: -20 }, color: 0xf59e0b }
        }
    },

    // Post-processing
    postProcessing: {
        bloom: {
            strength: 0.3,
            radius: 0.4,
            threshold: 0.85
        },
        toneMapping: {
            exposure: 1.0
        }
    },

    // UI settings
    ui: {
        loadingDuration: 2000,
        panelAnimationDuration: 300,
        interactionDistance: 5
    },

    // Mobile settings
    mobile: {
        joystickMaxDistance: 35,
        joystickDeadzone: 5
    }
};

export default CONFIG;
