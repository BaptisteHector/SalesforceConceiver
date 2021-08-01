import { Injectable } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirstPageComponent } from './components/first-page/first-page.component';
import { OtherPageComponent } from './components/other-page/other-page.component';

const routes: Routes = [
  { path: 'otherpage', component: OtherPageComponent },
  { path: 'firstpage', component: FirstPageComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);