import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChainReactionComponent } from './components/chain-reaction/chain-reaction.component';

const routes: Routes = [{
  path: 'chain-reaction',
  component: ChainReactionComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
