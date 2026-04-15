import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeepAliveService } from './services/keep-alive.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'arcus';

  constructor(private keepAlive: KeepAliveService) {}

  ngOnInit(): void {
    this.keepAlive.start();
  }
}
