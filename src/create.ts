import RAPIER from "@dimforge/rapier3d-compat"
import { StatusType, Vector } from "./types";
// import { ioExport } from "./index"

export let bodies: RAPIER.RigidBody[] = []
export let objSizes: Map<number, Vector> = new Map()

export const createCube = (world: RAPIER.World, type: "dynamic" | "fixed", size: Vector, pos: Vector, mass: number = 0): RAPIER.RigidBody => {
    let bodyDesc: RAPIER.RigidBodyDesc

    if(type === 'dynamic') {
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    } else if(type === 'fixed') {
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        bodyDesc.setCanSleep(false);
    } else {
        bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    }

    bodyDesc.setTranslation(pos.x, pos.y, pos.z)

    let rigidBody = world.createRigidBody(bodyDesc)

    let collider: RAPIER.ColliderDesc = RAPIER.ColliderDesc.cuboid(size.x, size.y, size.z)
    world.createCollider(collider, rigidBody)

    objSizes.set(bodies.length, { x: size.x, y: size.y, z: size.z })
    rigidBody.userData = bodies.length
    bodies.push(rigidBody)

    return rigidBody
}