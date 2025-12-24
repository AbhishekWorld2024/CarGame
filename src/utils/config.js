/**
 * Configuration file for 3D Car Experience
 * All tunable parameters are centralized here for easy adjustment
 * IMPROVED VERSION - Enhanced graphics, physics, and environment
 */

export const CONFIG = {
    // Scene settings - Enhanced sky and atmosphere
    scene: {
        backgroundColor: 0x7ec8e3,
        fogColor: 0x7ec8e3,
        fogNear: 80,
        fogFar: 300
    },

    // Camera settings - Improved follow camera
    camera: {
        fov: 55,
        near: 0.1,
        far: 600,
        followDistance: 12,
        followHeight: 5,
        lookAtHeight: 1.5,
        smoothness: 0.08,
        minHeight: 3,
        maxPitch: 0.3
    },

    // Lighting - Enhanced for better visuals
    lighting: {
        ambient: {
            color: 0xffffff,
            intensity: 0.5
        },
        directional: {
            color: 0xfff5e6,
            intensity: 1.2,
            position: { x: 60, y: 120, z: 40 },
            shadowMapSize: 4096,
            shadowCameraSize: 150
        },
        hemisphere: {
            skyColor: 0x87ceeb,
            groundColor: 0x3d5c3d,
            intensity: 0.5
        }
    },

    // Physics settings - More realistic
    physics: {
        gravity: -25,
        groundFriction: 0.8,
        groundRestitution: 0.2,
        fixedTimeStep: 1 / 60,
        maxSubSteps: 5
    },

    // Car settings - Improved handling and physics
    car: {
        chassisWidth: 2.0,
        chassisHeight: 0.7,
        chassisLength: 4.5,
        chassisMass: 200,
        
        wheelRadius: 0.45,
        wheelWidth: 0.35,
        wheelFriction: 8,
        wheelSuspensionStiffness: 35,
        wheelSuspensionDamping: 5,
        wheelSuspensionCompression: 5,
        wheelSuspensionRestLength: 0.35,
        wheelRollInfluence: 0.005,
        
        maxSteerAngle: 0.45,
        maxForce: 1200,
        maxBrakeForce: 80,
        
        acceleration: 1000,
        brakeForce: 50,
        steerSpeed: 0.04,
        steerReturnSpeed: 0.08,
        
        linearDamping: 0.1,
        angularDamping: 0.5,
        
        colors: {
            body: 0xe63946,
            bodyMetallic: 0.8,
            cabin: 0x1a1a2e,
            cabinMetallic: 0.2,
            wheels: 0x2d2d2d,
            chrome: 0xc0c0c0,
            lights: 0xffffee,
            taillights: 0xff3333
        }
    },

    // World settings - Enhanced environment
    world: {
        groundSize: 300,
        groundColor: 0x4a7c4e,
        roadColor: 0x3a3a3a,
        roadWidth: 14,
        sidewalkWidth: 3,
        sidewalkColor: 0x8a8a8a,
        
        rampHeight: 2.5,
        rampLength: 10,
        rampWidth: 8,
        
        obstacleColors: [0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4],
        
        houseColors: [0xf5f5dc, 0xe8d4b8, 0xd4c4a8, 0xfaf0e6, 0xffe4c4],
        roofColors: [0x8b4513, 0xa0522d, 0x6b4423, 0x8b0000, 0x4a4a4a],
        
        interactiveObjects: {
            about: { position: { x: 25, y: 0, z: 25 }, color: 0x6366f1 },
            projects: { position: { x: -25, y: 0, z: 25 }, color: 0x8b5cf6 },
            contact: { position: { x: 0, y: 0, z: -35 }, color: 0xf59e0b }
        }
    },

    // Post-processing - Enhanced effects
    postProcessing: {
        bloom: {
            strength: 0.4,
            radius: 0.5,
            threshold: 0.8
        },
        toneMapping: {
            exposure: 1.1
        }
    },

    // UI settings
    ui: {
        loadingDuration: 1500,
        panelAnimationDuration: 300,
        interactionDistance: 6
    },

    // Mobile settings
    mobile: {
        joystickMaxDistance: 35,
        joystickDeadzone: 5
    }
};

export default CONFIG;
