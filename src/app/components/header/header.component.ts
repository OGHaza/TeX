import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { modalAnimation, modalAnimationReverse, openCloseAnimation } from 'src/app/models/appAnimation';
import { ApplicationService } from 'src/app/services/application.service';
import { PlayerService } from 'src/app/services/player.service';
import { searchMenuItem } from 'src/app/models/searchMenu';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    openCloseAnimation,
    modalAnimation,
    modalAnimationReverse
  ]
})
export class HeaderComponent implements OnInit {
  constructor(
    public application:ApplicationService, 
    public player: PlayerService, 
    public router:Router,
    private localStorage: LocalStorageService
  ) { }

  showMenu: boolean = false;
  
  menuItems: searchMenuItem[] = [
    {
      title: "library.genres",
      icon: "theater-masks",
      page : "genres"
    },
  ];

  showMoviesSection: boolean = true;
  showTVSection: boolean = true;
  showMusicSection: boolean = true;

  ngOnInit(): void {
    this.router.url.indexOf("movie") != -1;
    this.updateShowMenu();
    
    this.showMoviesSection = this.localStorage.getData(STORAGE_KEYS.showMoviesSection) !== false;
    this.showTVSection = this.localStorage.getData(STORAGE_KEYS.showTVSection) !== false;
    this.showMusicSection = this.localStorage.getData(STORAGE_KEYS.showMusicSection) !== false;
    
    this.router.events.subscribe(() => {
      this.updateShowMenu();
    });
  }

  updateShowMenu() {
    const url = this.router.url;
    this.showMenu = url.includes('/movies') || url.includes('/tvshows') || url === '/search';
  }

  openRemote(){
    this.application.openRemote = true;
  }

  openPlayer(){
    this.application.showPlayer = !this.application.showPlayer;
  }

  isRoute(route: string) : boolean {
    return this.router.url.indexOf(route) != -1;
  }

}
