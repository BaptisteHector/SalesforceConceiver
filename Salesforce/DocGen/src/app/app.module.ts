import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { appRoutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OauthcallbackComponent } from './components/oauthcallback/oauthcallback.component';
import { HomeComponent } from './components/home/home.component';


// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MenuToolbarComponent } from './components/menu-toolbar/menu-toolbar.component';
import { ForceService } from './common/Services';
import { DataModelComponent } from './components/data-model/data-model.component';


@NgModule({
  declarations: [
    AppComponent,
    ContactDetailsComponent,
    OauthcallbackComponent,
    DashboardComponent,
    HomeComponent,
    MenuToolbarComponent,
    DataModelComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { useHash: false }),
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [RouterModule],
  providers: [ ForceService],
  bootstrap: [AppComponent]
})
export class AppModule { }

