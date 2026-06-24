import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameEngineService } from '../../services/game-engine.service';
import { Player } from '../../utility/interfaces';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-local-settings',
  templateUrl: './local-settings.component.html',
  styleUrls: ['./local-settings.component.scss'],
})
export class LocalSettingsComponent {
  playerCnt = 2;
  rowCnt = 5;
  colCnt = 5;
  playerNames: string[] = ['', '', '', '', '', '', ''];

  get playerSlots(): number[] {
    return Array.from({ length: this.playerCnt }, (_, i) => i);
  }

  constructor(
    private router: Router,
    public engine: GameEngineService,
  ) {}

  startGame(): void {
    const players: Player[] = this.engine.allPlayers
      .slice(0, this.playerCnt)
      .map((p, i) => ({ ...p, name: this.playerNames[i]?.trim() || p.color }));

    this.router.navigate(['/chain-reaction'], {
      state: { playerCnt: this.playerCnt, rowCnt: this.rowCnt, colCnt: this.colCnt, players },
    });
  }

  goHome(): void { this.router.navigate(['/home']); }
}
