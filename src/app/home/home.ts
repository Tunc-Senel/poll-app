import { Component } from '@angular/core';
import { Header } from '../shared/header/header';

@Component({
  imports: [Header],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
