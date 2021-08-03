import { Component, OnInit } from '@angular/core';
import { Contact } from '../common/interfaces/contact';
import { ForceService } from '../common/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [ForceService],
})
export class DashboardComponent implements OnInit {

  contacts: any;
  selectedContact: Contact = new Contact;
  loggedUser: any;
  loading: any = true;

  constructor(private forceService: ForceService) {
    this.forceService.init({
      appId: '3MVG9sG9Z3Q1Rlbc4tkIx2fI3ZUDVyYt86Ypl8ZqBXTpzPbQNHxq7gpwKcN75BB.fpgHxzSWgwgRY6nVfvBUe',
      proxyURL: 'https://dev-cors-proxy.herokuapp.com/'
    });
  }

  ngOnInit() {
    if (this.forceService.isLoggedIn()) {
      this.onLogin();
    } else {
      this.loading = false;
    }
  }

  onLogin() {
    this.loading = true;
      this.forceService.login()?.then(() => {
        this.loading = false;
        this.loggedUser = this.forceService.getUserId();
        this.getData();
      });  
  }

  getData() {
    this.loading = true;
    this.forceService.query('select id, firstname, lastname, phone from contact').then(result => {
      this.loading = false;
      this.contacts = (<any>result).records;
    });
  }

  onSelect(contact: Contact) {
      this.selectedContact = contact;
  }

}
