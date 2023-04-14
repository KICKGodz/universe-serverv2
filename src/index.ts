import Ammo from 'ammojs-typed'
import { createServer, request } from "http"
const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});
import axios from "axios"
import { Server, Socket } from "socket.io"
const io = new Server(server, { maxHttpBufferSize: 1e8 });
import { BodyPacket, Player, StatusType, Stats, Vector, Rotation } from './types';
import { Config } from './config';
import { log } from './console';
import WhiteListManager from './managers/WhiteListManager';
import BlackListManager from './managers/BlackListManager';
import { objSizes, bodies, createCube } from './create';
import RAPIER from '@dimforge/rapier3d-compat';
const port = 5174
// export const ioExport = io 

const options = {
    hostname: 'http://localhost:5175',
    path: '/server',
};

const sendServerUpdate = (status: string) => {
    let jsonData = {
        port: port,
        status: status,
        name: "MediaDev >>> Fast DL | Best Server | $10,000 Start | 100 Prop Limit | Friendly Admins"
    }
    
    axios.post(options.hostname + options.path, jsonData)
        .then((res) => {
            log(`Server received ${status} status!`)
        })
}

let worldInit: boolean = false
let world: RAPIER.World
let stats: Stats = {
    players: 0
}

const whitelist = new WhiteListManager()
const blacklist = new BlackListManager()

io.on('connection', (socket: Socket) => {
    var address = `${socket.handshake.headers["x-real-ip"]}:${socket.handshake.headers["host"]?.split(":")[1]}`;
    log('New connection from ' + address);
    socket.on("join", (player: Player) => {
        eventHandler(socket, player)
    })
});

const leaveAllRooms = (socket: Socket) => {
    let keys = socket.nsp.adapter.rooms.keys()
    for (let x = 0; x < socket.nsp.adapter.rooms.size; x++) {
        socket.leave(keys.next().value)
    }
}

const placeObjects = (socket: Socket) => {
    world.bodies.forEach(body => {
        const localSize = objSizes.get(<number>body.userData)
        let bodyPacket = { "id": body.userData, s: localSize, t: body.translation(), r: body.rotation() } as BodyPacket
        // console.log(Buffer.from(JSON.stringify(bodyPacket)))
        socket.emit("bodyCreate", Buffer.from(JSON.stringify(bodyPacket)))
    })
    leaveAllRooms(socket)
    socket.join(StatusType.SERVER)
}

const eventHandler = (socket: Socket, player: Player) => {
    // WhiteList
    if(Config.whitelist && !whitelist.getList().includes(player.id)) { socket.emit("server_error", "You are not whitelisted!"); return }
    // BlackList
    if(blacklist.getList().includes(player.id)) { socket.emit("server_error", "You are blacklisted!"); return }
    // Server Not Up Yet
    if(!worldInit) { socket.emit("server_error", "Server is not ready!"); return }
    // Server Full
    if(stats.players >= Config.max) { socket.emit("server_error", "Server is full!"); return }
    placeObjects(socket)
    stats.players++
    log(`${player.name} (${player.id}) has joined the server. | ${stats.players}/${Config.max}`)
    socket.on("disconnect", () => {
        stats.players--
        log(`${player.name} (${player.id}) has left the server. | ${stats.players}/${Config.max}`)
    })
    socket.on("status", (status: StatusType) => {
        leaveAllRooms(socket)
        socket.join(status)
    })
}

server.listen(port, () => {
    log(`Server started on port ${port}`)
    startRapier()
})

const startRapier = () => {
    RAPIER.init().then(() => {
        let gravity = { x: 0.0, y: -9.81, z: 0.0 };
        world = new RAPIER.World(gravity);

        worldInit = true
        log("World has been initiated")
    
        createCube(world, "fixed", { x: 10, y: 1, z: 10 }, { x: 0, y: 0, z: 0 })
    
        for (let x = 1; x <= 100; x++) {
            createCube(world, "dynamic", { x: 1, y: 1, z: 1 }, { x: 0, y: 5 * x, z: 0 })   
        }
    
        // Game loop. Replace by your own game loop system.
        let gameLoop = () => {
            if(stats.players > 0) {
                world.step();

                let packetData: any[] = []
                world.bodies.forEach(body => {
                    if(body.isSleeping()) return
                    packetData.push({ "id": body.userData, "t": body.translation(), "r": body.rotation() })
                    
                    if(body.translation().y <= -5 && (!body.isSleeping() || !body.isEnabled())) {
                        world.removeRigidBody(body)
                        io.to(StatusType.SERVER).emit("deleteBody", body.userData)
                    }
                })
    
                io.to(StatusType.SERVER).emit("packet", Buffer.from(JSON.stringify(packetData)))
            }
            setTimeout(gameLoop, 16);
        };
        gameLoop();
        log("Server Ready")
        sendServerUpdate("starting")
    })
}

const closeServer = () => {
    log("Quit command recieved, shutting down server peacefully!");
    
    sendServerUpdate("stopping")
    io.disconnectSockets(true)
    setTimeout(() => {
        io.close((ioerr) => {
            server.close((serverr) => {
                process.exit(0);
            });
        })
    }, 2000);
}

const closeServerSIG = () => {
    log("SIGTERM signal received, please use 'quit' command while server is running!");
    
    sendServerUpdate("stopping")
    io.disconnectSockets(true)
    setTimeout(() => {
        io.close((ioerr) => {
            server.close((serverr) => {
                process.exit(0);
            });
        })
    }, 2000);
}

process.on("SIGTERM", closeServerSIG);
process.on("SIGINT", closeServerSIG)
