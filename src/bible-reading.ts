import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BibleExcerpt } from "./bible-excerpt.js";
import { BibleQuestions } from "./bible-questions.js";
import { BibleReadingCalendar, ReadingDateSelectedEvent } from "./bible-reading-calendar.js";
import './bible-questions.js';
import './bible-reading-calendar.js';

@customElement('bible-reading')
export class BibleReading extends LitElement {
  
  @property({type: String}) translation: string = 'UBIO';
  @property({type: Array}) reading: string = '';

  protected render() {
    return html`<bible-reading-calendar @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
      this.reading = event.detail.reading;
    }}"></bible-reading-calendar>
    <bible-questions translation="${this.translation}" .content="${this.reading}"></bible-questions>`
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
    'bible-reading': BibleReading;
    'bible-questions': BibleQuestions;
    'bible-reading-calendar': BibleReadingCalendar;
  } 
}