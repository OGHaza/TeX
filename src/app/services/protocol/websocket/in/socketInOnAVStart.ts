import { PlayerService } from "../../../player.service";
import { ApplicationService } from "../../../application.service";
import { SocketIn } from "./socketIn";

export class SocketInOnAVStart extends SocketIn {

    static method:string = "Player.OnAVStart";

    constructor(private player:PlayerService, private application: ApplicationService){
        super()
    }

    handle(data: any){        
        this.player.setDefaultPlayer();
        this.application.showPlayer = true;
    }

}