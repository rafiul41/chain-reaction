import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly isWakingServer = signal(false);

  constructor(private router: Router) {}

  goToLocal() { this.router.navigate(['/local']); }

  async goToOnline() {
    this.isWakingServer.set(true);
    try {
      await fetch(`${environment.serverUrl}/health`, { signal: AbortSignal.timeout(60000) });
    } catch {
      // Server didn't wake in time; navigate anyway and let the lobby handle the connection
    } finally {
      this.isWakingServer.set(false);
      this.router.navigate(['/online']);
    }
  }

  goToRules() { this.router.navigate(['/game-rules']); }
}
