import { Component, HostListener, OnInit } from '@angular/core';
import { fastFadeAnimation, heightAnimation, modalAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { AudioDetailsSong } from 'src/app/models/kodiInterfaces/audio';
import { VideoDetailsMovie, VideoDetailsTVShow } from 'src/app/models/kodiInterfaces/video';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { SearchService } from 'src/app/services/search.service';
import { searchMenuItem } from 'src/app/models/searchMenu';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [
    openCloseAnimation,
    modalAnimation,
    heightAnimation,
    fastFadeAnimation
  ]
})
export class SearchComponent implements OnInit {

  showFilterBox = false;

  itemMenu:searchMenuItem[] = [
    {
      title: "library.genres",
      icon: "theater-masks",
      page : "genres"
    },
  ]

  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
    
  }

  
  modelChangeFn(e:any){
    this.searchService.searchFilterField = e;
  }

  toggleFilterBox(){
    this.showFilterBox = !this.showFilterBox
  }

  getFilterBoxVisibility(){
    let x = document.getElementById("toggleFilterButton");
    if (window.getComputedStyle(x!).display === "none") {
      return true
    } else {
      return this.showFilterBox
    }
  }

  hasActiveFilters(): boolean {
    return this.searchService.directorsFilter.length > 0 ||
           this.searchService.writersFilter.length > 0 ||
           this.searchService.actorsFilter.length > 0 ||
           this.searchService.yearsFilter.length > 0 ||
           this.searchService.genresFilter.length > 0 ||
           this.searchService.collectionsFilter.length > 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:Event) {
    this.getFilterBoxVisibility()
  }

}
