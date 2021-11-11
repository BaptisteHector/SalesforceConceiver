import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ForceService } from './force.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private forceservice: ForceService) { }

  canActivate() {
    if (this.forceservice.isLoggedIn())
      return true;
    else
      return false;
  }
}
