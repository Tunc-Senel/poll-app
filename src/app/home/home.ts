import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Hero } from './hero/hero';
import { SurveyList } from './survey-list/survey-list';

@Component({
  imports: [Header, Hero, SurveyList],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
