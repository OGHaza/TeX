import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { heightAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
  animations: [
    openCloseAnimation,
    heightAnimation
  ]
})
export class SearchbarComponent implements OnInit {

  @ViewChild('searchInput') searchInput: any;

  constructor(public searchService: SearchService, private elementRef: ElementRef) { }

  ngOnInit(): void {

  }

  private isUserTypingInSearchbar(): boolean {
    const inputEl: HTMLInputElement | null = this.searchInput?.nativeElement ?? this.elementRef.nativeElement.querySelector('input');
    return !!inputEl && document.activeElement === inputEl;
  }

  modelChangeFn(e:any){

    // Avoid navigation when the model changes programmatically (e.g. clearFilters from quick buttons).
    if(!this.isUserTypingInSearchbar()){
      return;
    }

    if(this.searchService.textSearch != ""){
      this.searchService.openSearchPageFromTyping();
    } else {
      this.searchService.closeSearchPage();
    }
  }

}
