import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToLocal() {
    this.router.navigate(['/local']);
  }

  goToOnline() {
    this.router.navigate(['/online']);
  }

  goToRules() {
    this.router.navigate(['/game-rules']);
  }
}
