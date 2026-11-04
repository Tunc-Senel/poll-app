import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Hero } from './hero/hero';

@Component({
  imports: [Header, Hero],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
