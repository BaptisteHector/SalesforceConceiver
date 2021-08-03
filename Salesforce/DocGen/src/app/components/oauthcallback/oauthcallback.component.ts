import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oauthcallback',
  templateUrl: './oauthcallback.component.html',
  styleUrls: ['./oauthcallback.component.css']
})
export class OauthcallbackComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const event = new CustomEvent('oauthCallback', {'detail': window.location.href});
    window.opener?.document.dispatchEvent(event);
    window.close();
  }

}
