import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BibleExcerpt } from "./bible-excerpt.js";
import { BibleQuestions } from "./bible-questions.js";
import { BibleReadingCalendar, ReadingDateSelectedEvent } from "./bible-reading-calendar.js";
import './bible-questions.js';
import './bible-reading-calendar.js';

@customElement('bible-reading')
export class BibleReading extends LitElement {
  
  @property({type: Date}) currentReadingDate?: Date;
  @property({type: Number}) today: Date = new Date();
  @property({type: Array}) reading: string = '';

  protected render() {
    return html`<bible-reading-calendar .date="${this.today}" @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
      this.currentReadingDate = event.detail.date;
      this.reading = event.detail.reading;
    }}"></bible-reading-calendar>
    <bible-questions .content="${this.reading}"></bible-questions>`
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