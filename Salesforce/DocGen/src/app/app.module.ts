import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app-routing.module';

import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OauthcallbackComponent } from './components/oauthcallback/oauthcallback.component';

@NgModule({
  declarations: [
    AppComponent,
    ContactDetailsComponent,
    OauthcallbackComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { useHash: false }),
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

