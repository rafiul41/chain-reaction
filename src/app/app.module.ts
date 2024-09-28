import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChainReactionComponent } from './components/chain-reaction/chain-reaction.component';
import { HomeComponent } from './components/home/home.component';
import { GameRulesComponent } from './components/game-rules/game-rules.component';

@NgModule({
  declarations: [
    AppComponent,
    ChainReactionComponent,
    HomeComponent,
    GameRulesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
