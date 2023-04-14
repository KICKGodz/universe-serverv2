import { Socket } from "socket.io";
import { readFile } from "fs";
import * as path from "path"
import { log } from "../console";

export default class BlackListManager {
    private blacklistArray: string[]

    constructor() {
        this.blacklistArray = []
        readFile(path.join(__dirname, "..", "misc", "blacklist.txt"), "utf8", (err, data) => {
            if(err) { console.log(err) }
            let playerData = data.split("\n").map(entry => {
                if(!entry.includes("#")) return entry
                return ""
            }).filter(n => n)
            this.blacklistArray = playerData
            log("Blacklist Loaded")
        })
    }

    getList() {
        return this.blacklistArray
    }

    addPlayer() {
        
    }
}