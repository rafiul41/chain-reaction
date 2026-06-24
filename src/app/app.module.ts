import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChainReactionComponent } from './components/chain-reaction/chain-reaction.component';
import { HomeComponent } from './components/home/home.component';
import { GameRulesComponent } from './components/game-rules/game-rules.component';
import { LocalSettingsComponent } from './components/local-settings/local-settings.component';
import { OnlineLobbyComponent } from './components/online-lobby/online-lobby.component';
import { OnlineChainReactionComponent } from './components/online-chain-reaction/online-chain-reaction.component';

@NgModule({
  declarations: [
    AppComponent,
    ChainReactionComponent,
    HomeComponent,
    GameRulesComponent,
    LocalSettingsComponent,
    OnlineLobbyComponent,
    OnlineChainReactionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
