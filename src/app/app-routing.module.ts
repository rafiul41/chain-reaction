import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChainReactionComponent } from './components/chain-reaction/chain-reaction.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'chain-reaction',
    component: ChainReactionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
