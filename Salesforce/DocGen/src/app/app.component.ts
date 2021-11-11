import { Component } from '@angular/core';
import { ForceService } from './common/Services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ForceService],
})
export class AppComponent {
  title = 'YesWeKnow';

  constructor (forceService: ForceService) {
    forceService.init({});
  }
}
