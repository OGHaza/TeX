import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { searchMenuItem } from 'src/app/models/searchMenu';
import { FilterList, SearchService } from 'src/app/services/search.service';
import { ApplicationService } from 'src/app/services/application.service';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';
import { KodiApiService } from 'src/app/services/kodi-api.service';

type GenreQuickFilter = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-movies-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MoviesMenuComponent implements OnInit {

  constructor(
    private router: Router, 
    private searchService: SearchService,
    public application: ApplicationService,
    private localStorage: LocalStorageService,
    private kodiApi: KodiApiService
  ) { }

  @Input() items: searchMenuItem[] = [];
  @Input() searchPageButton: boolean = false

  stickyMenu: boolean = true;

  genreQuickFilters: GenreQuickFilter[] = [];
  enabledGenreBarGenres: Set<string> = new Set();

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres() {
    const stored = this.localStorage.getData(STORAGE_KEYS.genreBarGenres);
    if (stored) {
      this.enabledGenreBarGenres = new Set(stored);
    }

    this.kodiApi.media.getVideoLibraryGenres({ type: 'movie' }).subscribe((resp) => {
      if (resp?.genres) {
        let genres = resp.genres.map(g => ({
          label: g.title,
          value: g.title
        }));
        
        if (this.enabledGenreBarGenres.size === 0) {
          this.enabledGenreBarGenres = new Set(genres.map(g => g.value));
          this.localStorage.setData(STORAGE_KEYS.genreBarGenres, Array.from(this.enabledGenreBarGenres));
        }
        
        this.genreQuickFilters = genres.filter(g => this.enabledGenreBarGenres.has(g.value));
      }
    });
  }

  get stickyTop(): string {
    if (!this.stickyMenu) return '0';
    return '57px';
  }

  isPage(page: string): boolean {
    return page == this.router.url.split("/")[2];
  }

  navigate(url: string){

    if(url == this.router.url.split("/")[2]){
      this.router.navigate([this.router.url.split("/")[1]]);
      return;
    }

    this.router.navigate([this.router.url.split("/")[1] + "/" + url]);
  }

  private getBaseRouteForSearchScope(): string {
    if (this.router.url === '/search' && this.searchService.backUrl) {
      return this.searchService.backUrl.split('/')[1] ?? '';
    }

    return this.router.url.split('/')[1] ?? '';
  }

  openGenreSearch(genre: string){
    this.searchService.clearFilters();
    this.searchService.showFilterMenu = '';
    this.searchService.getArrayFilterFromFilter(FilterList.Genres).push(genre);

    const isOnSearch = this.router.url === '/search';
    if(!isOnSearch){
      const baseRoute = this.getBaseRouteForSearchScope();
      if(baseRoute === 'movies'){
        this.searchService.searchMovies = true;
        this.searchService.searchTvShows = false;
      } else if(baseRoute === 'tvshows'){
        this.searchService.searchMovies = false;
        this.searchService.searchTvShows = true;
      }
    } else {
      if(!this.searchService.searchMovies && !this.searchService.searchTvShows){
        const baseRoute = this.getBaseRouteForSearchScope();
        if(baseRoute === 'movies'){
          this.searchService.searchMovies = true;
        } else if(baseRoute === 'tvshows'){
          this.searchService.searchTvShows = true;
        }
      }
    }

    this.searchService.openSearchPage();
  }

  mouseDown: boolean = false;
  treeshold = 0;
  previousMouseX  = 0;
  @ViewChild('scrollElement') scrollViewElement:any; 

  public onMouseMove(event: MouseEvent) {
    
    if (!this.mouseDown)
      return;
    let moveX = event.x - this.previousMouseX;
    this.previousMouseX = event.x;

    if (this.treeshold == 10) {
      this.treeshold -= .1;
      return;
    }
    

    let previousTS = this.treeshold;
    this.treeshold = Math.max(0, this.treeshold - Math.abs(moveX));
    let diff = previousTS - this.treeshold;
    if (moveX < 0)
      diff = -diff;
    
    moveX -= diff;

    this.scrollViewElement.nativeElement.scrollBy({
      left: -moveX
    });
  }

  @HostListener('window:mouseup')
  private mouseUp() {
    this.mouseDown = false;
  }

}
