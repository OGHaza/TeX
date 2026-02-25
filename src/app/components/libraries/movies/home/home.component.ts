import { Component, OnInit, HostListener } from '@angular/core';
import { fastFadeAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { Filter, FilterOperatorList } from 'src/app/models/filter';
import { ListFilterFieldsMovies } from 'src/app/models/kodiInterfaces/listFilter';
import { ListSort, ListSortMethod, ListSortOrder } from 'src/app/models/kodiInterfaces/listItem';
import { ListLimits } from 'src/app/models/kodiInterfaces/others';
import { VideoDetailsMovie } from 'src/app/models/kodiInterfaces/video';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-movies-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    openCloseAnimation,
    fastFadeAnimation
  ],
})
export class MoviesHomeComponent implements OnInit {

  maxMoviesPerPage:number = 50;
  moviesCount = 0;
  currentPage = 0;

  isLoadingMovies = true;
  isLoadingMore = false;
  hasMoreMovies = true;

  inProgressMovies: VideoDetailsMovie[] = [];
  recentlyAddedMovies: VideoDetailsMovie[] = [];
  unwatchedMovies: VideoDetailsMovie[] = [];

  movies: VideoDetailsMovie[] = [];

  sortby: Map<string, ListSort> = new Map;
  currentSort: ListSort;

  showContinueWatching: boolean = true;
  showRecentlyAdded: boolean = true;
  showUnwatched: boolean = true;

  constructor(
    private kodiApi: KodiApiService,
    private localStorage: LocalStorageService
  ) {
    this.currentSort = {ignorearticle: true,  method: ListSortMethod.title, order: ListSortOrder.ascending};

    this.sortby.set("alphabetical", this.currentSort);
    this.sortby.set("alphabeticalInversed", {ignorearticle: true,  method: ListSortMethod.title, order: ListSortOrder.descending});
    this.sortby.set("random", {ignorearticle: true,  method: ListSortMethod.random});
   }

  ngOnInit(): void {
    this.showContinueWatching = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingMovies) !== false;
    this.showRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.showRecentlyAdded) !== false;
    this.showUnwatched = this.localStorage.getData(STORAGE_KEYS.showUnwatched) !== false;
    
    if (this.showContinueWatching) this.getInProgressMovies();
    if (this.showRecentlyAdded) this.getRecentlyAddedMovies();
    if (this.showUnwatched) this.getUnwatchedMovies();
    this.getMovies();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isLoadingMore || !this.hasMoreMovies) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 400;
    
    if (scrollPosition >= scrollThreshold) {
      this.loadMoreMovies();
    }
  }

  changeSort(sort: ListSort){
    this.currentSort = sort;
    this.currentPage = 0;
    this.movies = [];
    this.hasMoreMovies = true;
    this.getMovies(); 
  }

  getInProgressMovies(){

    const limitReq: ListLimits = {
      start: 0,
      end : 20
    }

    const progressFilter: Filter = {
      field: ListFilterFieldsMovies.inprogress,
      operator: FilterOperatorList.true,
      value: ""
    } 
    
    this.kodiApi.media.getMovies({limit:limitReq, filter: progressFilter }).subscribe((resp) => {
      if(resp.movies)
        this.inProgressMovies = resp.movies;
    });
  }

  getRecentlyAddedMovies(){  

    const limitReq: ListLimits = {
      start: 0,
      end : 20
    }

    this.kodiApi.media.getRecentlyAddedMovies({limit:limitReq}).subscribe((resp) => {
      if(resp?.movies)
        this.recentlyAddedMovies = resp.movies;
    });
  }

  getUnwatchedMovies(){

    const limitReq: ListLimits = {
      start: 0,
      end : 20
    }

    const filter: Filter = {
      field: ListFilterFieldsMovies.playcount,
      operator: FilterOperatorList.is,
      value: "0"
    } 

    const ratingSort:ListSort = {
      ignorearticle: true,  
      method: ListSortMethod.rating, 
      order: ListSortOrder.descending
    };
    
    this.kodiApi.media.getMovies({limit:limitReq, filter: filter, sort:ratingSort }).subscribe((resp) => {
      if(resp?.movies)
        this.unwatchedMovies = resp.movies;
    });
  }

  getMovies(){
    const limitReq: ListLimits = {
      start: this.currentPage * this.maxMoviesPerPage,
      end : this.currentPage * this.maxMoviesPerPage + this.maxMoviesPerPage
    }

    this.isLoadingMovies = true;

    this.kodiApi.media.getMovies({limit:limitReq, sort: this.currentSort}).subscribe((resp) => {
      if(resp?.movies){
        this.movies = resp.movies;
        this.moviesCount = resp.limits.total;
        this.hasMoreMovies = this.movies.length < this.moviesCount;
        this.isLoadingMovies = false;
      }  
    });
  }

  loadMoreMovies() {
    if (this.isLoadingMore || !this.hasMoreMovies) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    const limitReq: ListLimits = {
      start: this.currentPage * this.maxMoviesPerPage,
      end: this.currentPage * this.maxMoviesPerPage + this.maxMoviesPerPage
    };

    this.kodiApi.media.getMovies({limit: limitReq, sort: this.currentSort}).subscribe((resp) => {
      if (resp?.movies) {
        this.movies = [...this.movies, ...resp.movies];
        this.hasMoreMovies = this.movies.length < this.moviesCount;
      }
      this.isLoadingMore = false;
    });
  }

}
