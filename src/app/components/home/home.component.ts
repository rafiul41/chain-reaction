import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isComingSoonVibrate = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  goToGame() {
    this.router.navigate(['/chain-reaction']);
  }

  goToRules() {
    this.router.navigate(['/game-rules']);
  }

  startVibrate() {
    this.isComingSoonVibrate = true;
  }

  endVibrate() {
    this.isComingSoonVibrate = false;
  }
}
