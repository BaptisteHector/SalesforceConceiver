import { Component, OnInit } from '@angular/core';
import { ForceService } from '../../common/Services';

@Component({
  selector: 'app-menu-toolbar',
  templateUrl: './menu-toolbar.component.html',
  styleUrls: ['./menu-toolbar.component.css'],
})
export class MenuToolbarComponent implements OnInit {

  loggedUser: any;

  constructor(private forceService: ForceService)
  {
    console.log("TOOLBAR", this.forceService);
  }
  
  ngOnInit(): void {
    if (this.forceService.isLoggedIn()) {
      this.onLogin();
    } else {
    }
  }
  
  display() {    
  }

  onLogin() {
      this.forceService.login()?.then(() => {
        this.loggedUser = this.forceService.getUserId();
      });
  }

  onLogout() {
    this.forceService.logout();
    this.loggedUser = false;
    window.location.reload();
  }
}
