import { Socket } from "socket.io";
import { readFile } from "fs";
import * as path from "path"
import { log } from "../console";

export default class WhiteListManager {
    private whitelistArray: string[]

    constructor() {
        this.whitelistArray = []
        readFile(path.join(__dirname, "..", "misc", "whitelist.txt"), "utf8", (err, data) => {
            if(err) { console.log(err) }
            let playerData = data.split("\n").map(entry => {
                if(!entry.includes("#")) return entry
                return ""
            }).filter(n => n)
            this.whitelistArray = playerData
            log("Whitelist Loaded")
        })
    }

    getList() {
        return this.whitelistArray
    }

    addPlayer() {
        
    }
}