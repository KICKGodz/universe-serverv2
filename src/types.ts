import Ammo from "ammojs-typed"

export type Stats = {
    players: number
}

export enum StatusType {
    LOADING = "loading",
    LOADED = "loaded",
    POSTLOADING = "post",
    SERVER = "server"
}

export type Player = {
    /**
     * Name of the Player
     */
    name: string,
    /**
     * Unique ID of the Player
     */
    id: string
}

export interface Vector {
    x: number;
    y: number;
    z: number;
}

export interface Rotation {
    x: number;
    y: number;
    z: number;
    w: number;
}

export type Packet = {
    /**
     * ID of the RigidBody
     */
    id: number,
    /**
     * The Translation of the RigidBody
     */
    t: Vector,
    /**
     * The Translation of the RigidBody
     */
    r: Rotation,
}

export type BodyPacket = {
    /**
     * ID of the RigidBody
     */
    id: number,
    /**
     * The Width of the RigidBody
     */
    s: Vector,
    /**
     * The X Position of the RigidBody
     */
    t: Vector,
    r: Rotation
}