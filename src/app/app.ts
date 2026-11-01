import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateSurvey } from './create-survey/create-survey';

@Component({
  imports: [RouterOutlet, CreateSurvey],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
