import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/homePage/homePage.component').then(m => m.HomePageComponent)
  },
  {
    path: '**', redirectTo: 'home'
  }
];
