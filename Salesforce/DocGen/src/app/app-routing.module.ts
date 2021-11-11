import { Routes } from '@angular/router';
import { AuthGuardService } from './common/Services/auth-guard.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DataModelComponent } from './components/data-model/data-model.component';
import { HomeComponent } from './components/home/home.component';
import { OauthcallbackComponent } from './components/oauthcallback/oauthcallback.component';

export const appRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
    { path: 'datamodel', component: DataModelComponent, canActivate: [AuthGuardService] },
    { path: 'home', component: HomeComponent },
    { path: 'oauthcallback.html', component: OauthcallbackComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: '404' }
];

