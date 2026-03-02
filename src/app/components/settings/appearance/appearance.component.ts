import { Component, OnInit } from '@angular/core';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';
import { KodiApiService } from 'src/app/services/kodi-api.service';

@Component({
  selector: 'app-settings-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss']
})
export class AppearanceComponent implements OnInit {

  showContinueWatchingMovies: boolean = true;
  showRecentlyAdded: boolean = true;
  showUnwatched: boolean = true;
  showContinueWatchingTV: boolean = true;
  showRecentlyAddedTV: boolean = true;
  showUnwatchedTV: boolean = true;
  showGenreCarousels: boolean = true;
  genreCarouselSortByRecentlyAdded: boolean = true;
  showMoviesSection: boolean = true;
  showTVSection: boolean = true;
  showMusicSection: boolean = true;

  availableGenres: string[] = [];
  genreBarGenres: Set<string> = new Set();
  carouselGenres: Set<string> = new Set();

  constructor(
    private localStorage: LocalStorageService,
    private kodiApi: KodiApiService
  ) { }

  ngOnInit(): void {
    this.showContinueWatchingMovies = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingMovies) !== false;
    this.showRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.showRecentlyAdded) !== false;
    this.showUnwatched = this.localStorage.getData(STORAGE_KEYS.showUnwatched) !== false;
    this.showContinueWatchingTV = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingTV) !== false;
    this.showRecentlyAddedTV = this.localStorage.getData(STORAGE_KEYS.showRecentlyAddedTV) !== false;
    this.showUnwatchedTV = this.localStorage.getData(STORAGE_KEYS.showUnwatchedTV) !== false;
    this.showGenreCarousels = this.localStorage.getData(STORAGE_KEYS.showGenreCarousels) !== false;
    this.genreCarouselSortByRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.genreCarouselSort) !== 'random';
    this.showMoviesSection = this.localStorage.getData(STORAGE_KEYS.showMoviesSection) !== false;
    this.showTVSection = this.localStorage.getData(STORAGE_KEYS.showTVSection) !== false;
    this.showMusicSection = this.localStorage.getData(STORAGE_KEYS.showMusicSection) !== false;

    const storedBar = this.localStorage.getData(STORAGE_KEYS.genreBarGenres);
    const storedCarousel = this.localStorage.getData(STORAGE_KEYS.enabledGenres);
    if (storedBar) this.genreBarGenres = new Set(storedBar);
    if (storedCarousel) this.carouselGenres = new Set(storedCarousel);

    this.loadGenres();
  }

  loadGenres() {
    this.kodiApi.media.getVideoLibraryGenres({ type: 'movie' }).subscribe((resp) => {
      if (resp?.genres) {
        this.availableGenres = resp.genres.map(g => g.title);
        
        if (this.genreBarGenres.size === 0) {
          this.genreBarGenres = new Set(this.availableGenres);
        }
        if (this.carouselGenres.size === 0) {
          this.carouselGenres = new Set(this.availableGenres);
        }
        this.saveGenres();
      }
    });
  }

  saveGenres() {
    this.localStorage.setData(STORAGE_KEYS.genreBarGenres, Array.from(this.genreBarGenres));
    this.localStorage.setData(STORAGE_KEYS.enabledGenres, Array.from(this.carouselGenres));
  }

  isGenreBarEnabled(genre: string): boolean {
    return this.genreBarGenres.has(genre);
  }

  isCarouselEnabled(genre: string): boolean {
    return this.carouselGenres.has(genre);
  }

  toggleGenreBar(genre: string, enabled: boolean) {
    if (enabled) {
      this.genreBarGenres.add(genre);
    } else {
      this.genreBarGenres.delete(genre);
    }
    this.saveGenres();
  }

  toggleCarousel(genre: string, enabled: boolean) {
    if (enabled) {
      this.carouselGenres.add(genre);
    } else {
      this.carouselGenres.delete(genre);
    }
    this.saveGenres();
  }



  toggleContinueWatchingMovies(value: boolean) {
    this.showContinueWatchingMovies = value;
    this.localStorage.setData(STORAGE_KEYS.showContinueWatchingMovies, value);
  }

  toggleRecentlyAdded(value: boolean) {
    this.showRecentlyAdded = value;
    this.localStorage.setData(STORAGE_KEYS.showRecentlyAdded, value);
  }

  toggleUnwatched(value: boolean) {
    this.showUnwatched = value;
    this.localStorage.setData(STORAGE_KEYS.showUnwatched, value);
  }

  toggleContinueWatchingTV(value: boolean) {
    this.showContinueWatchingTV = value;
    this.localStorage.setData(STORAGE_KEYS.showContinueWatchingTV, value);
  }

  toggleRecentlyAddedTV(value: boolean) {
    this.showRecentlyAddedTV = value;
    this.localStorage.setData(STORAGE_KEYS.showRecentlyAddedTV, value);
  }

  toggleUnwatchedTV(value: boolean) {
    this.showUnwatchedTV = value;
    this.localStorage.setData(STORAGE_KEYS.showUnwatchedTV, value);
  }

  toggleGenreCarousels(value: boolean) {
    this.showGenreCarousels = value;
    this.localStorage.setData(STORAGE_KEYS.showGenreCarousels, value);
  }

  toggleGenreCarouselSort(value: boolean) {
    this.genreCarouselSortByRecentlyAdded = value;
    this.localStorage.setData(STORAGE_KEYS.genreCarouselSort, value ? 'dateadded' : 'random');
  }

  toggleMoviesSection(value: boolean) {
    this.showMoviesSection = value;
    this.localStorage.setData(STORAGE_KEYS.showMoviesSection, value);
  }

  toggleTVSection(value: boolean) {
    this.showTVSection = value;
    this.localStorage.setData(STORAGE_KEYS.showTVSection, value);
  }

  toggleMusicSection(value: boolean) {
    this.showMusicSection = value;
    this.localStorage.setData(STORAGE_KEYS.showMusicSection, value);
  }

}
