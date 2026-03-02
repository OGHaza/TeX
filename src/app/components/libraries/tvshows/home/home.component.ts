import { Component, OnInit, HostListener } from '@angular/core';
import { ListSort, ListSortMethod, ListSortOrder } from 'src/app/models/kodiInterfaces/listItem';
import { VideoDetailsTVShow, VideoDetailsEpisode } from 'src/app/models/kodiInterfaces/video';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { ListLimits } from 'src/app/models/kodiInterfaces/others';
import { fastFadeAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';
import { Filter, FilterOperatorList } from 'src/app/models/filter';

@Component({
  selector: 'app-tvshow-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    openCloseAnimation,
    fastFadeAnimation
  ],
})
export class TvShowsHomeComponent implements OnInit {

  maxTVShowsPerPage:number = 50;
  tvShowsCount = 0;
  currentPage = 0;

  isLoadingTVShows = true;
  isLoadingMore = false;
  hasMoreTVShows = true;

  inProgressTVShows: VideoDetailsTVShow[] = [];
  recentlyAddedTVShows: VideoDetailsTVShow[] = [];
  unwatchedTVShows: VideoDetailsTVShow[] = [];
  tvShows: VideoDetailsTVShow[] = [];

  sortby: Map<string, ListSort> = new Map;
  currentSort: ListSort;

  showContinueWatching: boolean = true;
  showRecentlyAdded: boolean = true;
  showUnwatched: boolean = true;

  constructor(
    private kodiApi: KodiApiService,
    private localStorage: LocalStorageService
  ) {
    this.currentSort = {ignorearticle: true,  method: ListSortMethod.dateadded, order: ListSortOrder.descending};

    this.sortby.set("alphabetical", this.currentSort);
    this.sortby.set("alphabeticalInversed", {ignorearticle: true,  method: ListSortMethod.title, order: ListSortOrder.descending});
    this.sortby.set("random", {ignorearticle: true,  method: ListSortMethod.random});
    this.sortby.set("dateadded", {ignorearticle: true,  method: ListSortMethod.dateadded, order: ListSortOrder.descending});
    this.sortby.set("dateaddedInversed", {ignorearticle: true,  method: ListSortMethod.dateadded, order: ListSortOrder.ascending});
   }

  ngOnInit(): void {
    this.showContinueWatching = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingTV) !== false;
    this.showRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.showRecentlyAddedTV) !== false;
    this.showUnwatched = this.localStorage.getData(STORAGE_KEYS.showUnwatchedTV) !== false;
    
    if (this.showContinueWatching) this.getInProgressTVShows();
    if (this.showRecentlyAdded) this.getRecentlyAddedTVShows();
    if (this.showUnwatched) this.getUnwatchedTVShows();
    this.changeSort(this.currentSort);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isLoadingMore || !this.hasMoreTVShows) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 400;
    
    if (scrollPosition >= scrollThreshold) {
      this.loadMoreTVShows();
    }
  }

  changeSort(sort: ListSort){
    this.currentSort = sort;
    this.currentPage = 0;
    this.tvShows = [];
    this.hasMoreTVShows = true;
    this.getTVShows();
  }

  getInProgressTVShows(){
    
    this.kodiApi.media.getInProgressTvShows({}).subscribe((resp) => {
      if(resp?.tvshows)
        this.inProgressTVShows = resp.tvshows;
    });
  }

  getRecentlyAddedTVShows(){
    const limitReq: ListLimits = {
      start: 0,
      end : 20
    }

    const dateSort: ListSort = {
      ignorearticle: true,
      method: ListSortMethod.dateadded,
      order: ListSortOrder.descending
    };

    this.kodiApi.media.getTvShows({limit: limitReq, sort: dateSort}).subscribe((resp) => {
      if(resp?.tvshows){
        this.recentlyAddedTVShows = resp.tvshows;
      }
    });
  }

  getUnwatchedTVShows(){
    const limitReq: ListLimits = {
      start: 0,
      end : 20
    }

    const filter: Filter = {
      field: "playcount",
      operator: FilterOperatorList.is,
      value: "0"
    }

    const ratingSort:ListSort = {
      ignorearticle: true,  
      method: ListSortMethod.rating, 
      order: ListSortOrder.descending
    };
    
    this.kodiApi.media.getTvShows({limit:limitReq, filter: filter, sort:ratingSort }).subscribe((resp) => {
      if(resp?.tvshows)
        this.unwatchedTVShows = resp.tvshows;
    });
  }

  getTVShows(){
    const limitReq: ListLimits = {
      start: this.currentPage * this.maxTVShowsPerPage,
      end : this.currentPage * this.maxTVShowsPerPage + this.maxTVShowsPerPage
    }

    this.isLoadingTVShows = true;

    this.kodiApi.media.getTvShows({limit:limitReq, sort: this.currentSort}).subscribe((resp) => {
      if(resp?.tvshows){
        this.tvShows = resp.tvshows;
        this.tvShowsCount = resp.limits.total;
        this.hasMoreTVShows = this.tvShows.length < this.tvShowsCount;
        this.isLoadingTVShows = false;
      }
    });  
  }

  loadMoreTVShows() {
    if (this.isLoadingMore || !this.hasMoreTVShows) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    const limitReq: ListLimits = {
      start: this.currentPage * this.maxTVShowsPerPage,
      end: this.currentPage * this.maxTVShowsPerPage + this.maxTVShowsPerPage
    };

    this.kodiApi.media.getTvShows({limit: limitReq, sort: this.currentSort}).subscribe((resp) => {
      if (resp?.tvshows) {
        this.tvShows = [...this.tvShows, ...resp.tvshows];
        this.hasMoreTVShows = this.tvShows.length < this.tvShowsCount;
      }
      this.isLoadingMore = false;
    });
  }

}
