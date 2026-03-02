import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { fastFadeAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { Filter, FilterOperatorList } from 'src/app/models/filter';
import { ListFilterFieldsMovies } from 'src/app/models/kodiInterfaces/listFilter';
import { ListSort, ListSortMethod, ListSortOrder } from 'src/app/models/kodiInterfaces/listItem';
import { ListLimits } from 'src/app/models/kodiInterfaces/others';
import { VideoDetailsMovie } from 'src/app/models/kodiInterfaces/video';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';

type GenreCarousel = {
  name: string;
  movies: VideoDetailsMovie[];
  loaded: boolean;
  visible: boolean;
};

@Component({
  selector: 'app-movies-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    openCloseAnimation,
    fastFadeAnimation
  ],
})
export class MoviesHomeComponent implements OnInit, AfterViewInit {

  maxMoviesPerPage:number = 50;
  moviesCount = 0;
  currentPage = 0;

  isLoadingMovies = true;
  isLoadingMore = false;
  hasMoreMovies = true;

  inProgressMovies: VideoDetailsMovie[] = [];
  recentlyAddedMovies: VideoDetailsMovie[] = [];
  unwatchedMovies: VideoDetailsMovie[] = [];

  genreCarousels: GenreCarousel[] = [];
  enabledGenres: Set<string> = new Set();

  movies: VideoDetailsMovie[] = [];

  sortby: Map<string, ListSort> = new Map;
  currentSort: ListSort;

  showContinueWatching: boolean = true;
  showRecentlyAdded: boolean = true;
  showUnwatched: boolean = true;
  showGenreCarousels: boolean = true;
  sortByRecentlyAdded: boolean = true;

  private observer: IntersectionObserver | null = null;

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
    this.showContinueWatching = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingMovies) !== false;
    this.showRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.showRecentlyAdded) !== false;
    this.showUnwatched = this.localStorage.getData(STORAGE_KEYS.showUnwatched) !== false;
    this.showGenreCarousels = this.localStorage.getData(STORAGE_KEYS.showGenreCarousels) !== false;
    this.sortByRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.genreCarouselSort) !== 'random';
    
    this.loadEnabledGenres();
    
    if (this.showContinueWatching) this.getInProgressMovies();
    if (this.showRecentlyAdded) this.getRecentlyAddedMovies();
    if (this.showUnwatched) this.getUnwatchedMovies();
    
    if (this.showGenreCarousels) {
      this.loadGenres();
    }
    
    this.getMovies();
  }

  ngAfterViewInit() {
    setTimeout(() => this.setupIntersectionObserver(), 500);
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const genreName = entry.target.getAttribute('data-genre');
          if (genreName) {
            const carousel = this.genreCarousels.find(c => c.name === genreName);
            if (carousel && !carousel.loaded) {
              carousel.visible = true;
              this.loadGenreMovies(carousel);
            }
          }
        }
      });
    }, { rootMargin: '200px' });

    setTimeout(() => {
      document.querySelectorAll('[data-genre]').forEach(el => {
        this.observer?.observe(el);
      });
    }, 1000);
  }

  @HostListener('window:resize')
  onResize() {
    document.querySelectorAll('[data-genre]').forEach(el => {
      if (!el.hasAttribute('data-observed')) {
        el.setAttribute('data-observed', 'true');
        this.observer?.observe(el);
      }
    });
  }

  loadEnabledGenres() {
    const stored = this.localStorage.getData(STORAGE_KEYS.enabledGenres);
    if (stored) {
      this.enabledGenres = new Set(stored);
    }
  }

  saveEnabledGenres() {
    this.localStorage.setData(STORAGE_KEYS.enabledGenres, Array.from(this.enabledGenres));
  }

  toggleGenre(genre: string, enabled: boolean) {
    if (enabled) {
      this.enabledGenres.add(genre);
    } else {
      this.enabledGenres.delete(genre);
    }
    this.saveEnabledGenres();
    
    const carousel = this.genreCarousels.find(g => g.name === genre);
    if (carousel && !carousel.loaded && enabled) {
      this.loadGenreMovies(carousel);
    }
  }

  isGenreEnabled(genre: string): boolean {
    return this.enabledGenres.has(genre);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  loadGenres() {
    this.kodiApi.media.getVideoLibraryGenres({ type: 'movie' }).subscribe((resp) => {
      if (resp?.genres) {
        let carousels = resp.genres.map(genre => ({
          name: genre.title,
          movies: [],
          loaded: false,
          visible: false
        }));
        
        carousels = this.shuffleArray(carousels);
        
        this.genreCarousels = carousels;
        
        for (const carousel of this.genreCarousels) {
          if (this.enabledGenres.has(carousel.name) || this.enabledGenres.size === 0) {
            if (this.enabledGenres.size === 0) {
              this.enabledGenres.add(carousel.name);
            }
            this.loadGenreMovies(carousel);
          }
        }
        this.saveEnabledGenres();
      }
    });
  }

  loadGenreMovies(carousel: GenreCarousel) {
    if (carousel.loaded) return;
    
    const limitReq: ListLimits = { start: 0, end: 20 };
    const filter: Filter = {
      field: ListFilterFieldsMovies.genre,
      operator: FilterOperatorList.contains,
      value: carousel.name
    };
    
    const sort: ListSort = this.sortByRecentlyAdded 
      ? { ignorearticle: true, method: ListSortMethod.dateadded, order: ListSortOrder.descending }
      : { ignorearticle: true, method: ListSortMethod.random };

    this.kodiApi.media.getMovies({ limit: limitReq, filter: filter, sort: sort }).subscribe((resp) => {
      if (resp?.movies && resp.movies.length > 0) {
        carousel.movies = resp.movies;
        carousel.loaded = true;
      } else {
        carousel.movies = [];
        carousel.loaded = true;
      }
    });
  }

  getVisibleGenreCarousels(): GenreCarousel[] {
    return this.genreCarousels.filter(c => c.movies.length > 0 && this.enabledGenres.has(c.name));
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
    const limitReq: ListLimits = { start: 0, end: 20 };
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
    const limitReq: ListLimits = { start: 0, end: 20 };
    this.kodiApi.media.getRecentlyAddedMovies({limit:limitReq}).subscribe((resp) => {
      if(resp?.movies)
        this.recentlyAddedMovies = resp.movies;
    });
  }

  getUnwatchedMovies(){
    const limitReq: ListLimits = { start: 0, end: 20 };
    const filter: Filter = {
      field: ListFilterFieldsMovies.playcount,
      operator: FilterOperatorList.is,
      value: "0"
    } 
    const ratingSort: ListSort = {
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
