/**
 * Physics Manager - Handles cannon-es physics world and body management
 */

import * as CANNON from 'cannon-es';
import CONFIG from '../utils/config.js';

export class PhysicsManager {
    constructor() {
        this.world = null;
        this.bodies = [];
        this.meshes = [];
        
        this.init();
    }

    init() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, CONFIG.physics.gravity, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        
        this.world.defaultContactMaterial.friction = CONFIG.physics.groundFriction;
        this.world.defaultContactMaterial.restitution = CONFIG.physics.groundRestitution;
    }

    update(deltaTime) {
        this.world.step(
            CONFIG.physics.fixedTimeStep,
            deltaTime,
            CONFIG.physics.maxSubSteps
        );

        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const mesh = this.meshes[i];
            
            if (mesh && body) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        }
    }

    addBody(body, mesh) {
        this.world.addBody(body);
        if (mesh) {
            this.bodies.push(body);
            this.meshes.push(mesh);
        }
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
            this.meshes.splice(index, 1);
        }
        this.world.removeBody(body);
    }

    createBox(size, position, mass = 0, material = null) {
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        const body = new CANNON.Body({
            mass,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape,
            material
        });
        return body;
    }

    createSphere(radius, position, mass = 0, material = null) {
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape,
            material
        });
        return body;
    }

    createCylinder(radiusTop, radiusBottom, height, position, mass = 0) {
        const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 16);
        const body = new CANNON.Body({
            mass,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape
        });
        return body;
    }

    createPlane(position = { x: 0, y: 0, z: 0 }) {
        const shape = new CANNON.Plane();
        const body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape
        });
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        return body;
    }

    createMaterial(options = {}) {
        return new CANNON.Material(options);
    }

    createContactMaterial(material1, material2, options = {}) {
        const contactMaterial = new CANNON.ContactMaterial(material1, material2, options);
        this.world.addContactMaterial(contactMaterial);
        return contactMaterial;
    }

    getWorld() {
        return this.world;
    }
}

export default PhysicsManager;
