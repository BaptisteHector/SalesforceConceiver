import { Component, OnInit } from '@angular/core';
import { EntityDefinition } from 'src/app/common/Models/SalesforceAPIResponse/EntityDefinition';
import { ForceService } from '../../common/Services';

  @Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
  })
  export class DashboardComponent implements OnInit {
    
    contacts: any;
    selectedContact: EntityDefinition = new EntityDefinition;
    loading: any = false;
    
    constructor(private forceService: ForceService) {
      console.log("DASHBOARD", this.forceService);
    }
    
    ngOnInit() {
      this.getData();
    }
    
    getData() {
      this.loading = true;
      console.log("Getting Contacts");
      this.forceService.query('select id, firstname, lastname, phone from contact').then(result => {
        this.loading = false;
        this.contacts = (<any>result).records;
      });
    }
    
    onSelect(contact: EntityDefinition) {
      this.selectedContact = contact;
    }
    
  }  