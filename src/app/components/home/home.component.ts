import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToLocal() { this.router.navigate(['/local']); }
  goToOnline() { this.router.navigate(['/online']); }
  goToRules() { this.router.navigate(['/game-rules']); }
}
