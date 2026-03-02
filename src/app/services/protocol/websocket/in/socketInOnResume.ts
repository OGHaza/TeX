import { PlayerService } from "../../../player.service";
import { ApplicationService } from "../../../application.service";
import { SocketIn } from "./socketIn";

export class SocketInOnResume extends SocketIn {

    static method:string = "Player.OnResume";

    constructor(private player:PlayerService, private application: ApplicationService){
        super()
    }

    handle(data: any){
        this.player.getPlayerFromId(data.player.playerid)?.onPlayPause(true);
        this.application.showPlayer = true;
    }

}