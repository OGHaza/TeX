import { Component, OnInit } from '@angular/core';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { fastFadeAnimation, modalAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { ApplicationService } from 'src/app/services/application.service';
import { Location} from '@angular/common'; 
import { searchMenuItem } from 'src/app/models/searchMenu';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  animations: [
    modalAnimation,
    openCloseAnimation,
    fastFadeAnimation
  ],
})
export class MoviesComponent implements OnInit {

  constructor(private kodiApi:KodiApiService, private application:ApplicationService, private location:Location) {  }

  itemMenu:searchMenuItem[] = [
    {
      title: "library.genres",
      icon: "theater-masks",
      page : "genres"
    },
  ]

  ngOnInit(): void {

    this.location.onUrlChange(() => {
      this.checkUrl()
    });

    this.checkUrl();
    
  }

  checkUrl(){
    const routeData: (string)[] = this.location.path().split("/");
    if(routeData[1] == "movie"){
      this.kodiApi.media.getMovieDetail(parseInt(routeData[2])).subscribe(movie => {
        this.application.openMovieDetails.set(movie);
      })         
    } else if (routeData[1] == "collection") {
      this.kodiApi.media.getMovieSetDetail(parseInt(routeData[2])).subscribe(movieset => {
        this.application.openMovieSetDetails.set(movieset);
      })
    } else {
      this.application.openMovieDetails.set(undefined);
      this.application.openMovieSetDetails.set(undefined);
    }

  }


}
