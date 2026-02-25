import { Component, OnInit } from '@angular/core';
import { LocalStorageService, STORAGE_KEYS } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-settings-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss']
})
export class AppearanceComponent implements OnInit {

  stickyMenu: boolean = true;
  showContinueWatchingMovies: boolean = true;
  showRecentlyAdded: boolean = true;
  showUnwatched: boolean = true;
  showContinueWatchingTV: boolean = true;
  showRecentlyAddedTV: boolean = true;
  showUnwatchedTV: boolean = true;

  constructor(private localStorage: LocalStorageService) { }

  ngOnInit(): void {
    this.stickyMenu = this.localStorage.getData(STORAGE_KEYS.stickyMenu) !== false;
    this.showContinueWatchingMovies = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingMovies) !== false;
    this.showRecentlyAdded = this.localStorage.getData(STORAGE_KEYS.showRecentlyAdded) !== false;
    this.showUnwatched = this.localStorage.getData(STORAGE_KEYS.showUnwatched) !== false;
    this.showContinueWatchingTV = this.localStorage.getData(STORAGE_KEYS.showContinueWatchingTV) !== false;
    this.showRecentlyAddedTV = this.localStorage.getData(STORAGE_KEYS.showRecentlyAddedTV) !== false;
    this.showUnwatchedTV = this.localStorage.getData(STORAGE_KEYS.showUnwatchedTV) !== false;
  }

  toggleStickyMenu(value: boolean) {
    this.stickyMenu = value;
    this.localStorage.setData(STORAGE_KEYS.stickyMenu, value);
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

}
