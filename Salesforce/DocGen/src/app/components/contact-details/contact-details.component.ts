import { Component, OnInit, Input } from '@angular/core';
import { Contact } from '../common/interfaces/contact';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {

  @Input()
  contact: Contact | undefined;
  constructor() { }

  ngOnInit() {
  }

}
