import { Component, OnInit } from '@angular/core';
import { openCloseAnimation } from 'src/app/models/appAnimation';
import { GlobalTime } from 'src/app/models/kodiInterfaces/others';
import { kodiTimeToString } from 'src/app/models/utils';
import { ApplicationService } from 'src/app/services/application.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  animations: [
    openCloseAnimation
  ]
})
export class PlayerComponent implements OnInit {

  showPlaylist = false;

  constructor(public player: PlayerService, public application: ApplicationService) { }

  ngOnInit(): void {
    this.player.loadPlayer()
  }

  close(){
    this.showPlaylist = false;
    this.application.showPlayer = false;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  toggleDisplayPlaylist(){
    this.showPlaylist = !this.showPlaylist;

    if(this.showPlaylist){
      this.loadPlaylist();
    }
  }

  loadPlaylist(){
    this.player.currentPlayer?.loadPlaylist();  
  }


  getSongDuration(duration: GlobalTime | undefined, displayHours = true) : string {
    if(!duration) return "";
    return kodiTimeToString(duration, true, displayHours);
  }

}
