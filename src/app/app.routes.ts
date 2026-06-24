import { Routes } from '@angular/router';
import { ChainReactionComponent } from './components/chain-reaction/chain-reaction.component';
import { GameRulesComponent } from './components/game-rules/game-rules.component';
import { HomeComponent } from './components/home/home.component';
import { LocalSettingsComponent } from './components/local-settings/local-settings.component';
import { OnlineLobbyComponent } from './components/online-lobby/online-lobby.component';
import { OnlineChainReactionComponent } from './components/online-chain-reaction/online-chain-reaction.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'local', component: LocalSettingsComponent },
  { path: 'chain-reaction', component: ChainReactionComponent },
  { path: 'online', component: OnlineLobbyComponent },
  { path: 'online/game', component: OnlineChainReactionComponent },
  { path: 'game-rules', component: GameRulesComponent },
];
