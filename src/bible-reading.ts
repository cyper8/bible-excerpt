import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { BibleExcerpt } from "./bible-excerpt.js";
import { BibleQuestions } from "./bible-questions.js";
import { BibleReadingHistoryButton, ReadingDateSelectedEvent } from "./bible-reading-history-button.js";
import './bible-questions.js';
import './bible-reading-history-button.js';

@customElement('bible-reading')
export class BibleReading extends LitElement {
  
  @property({type: Date}) currentReadingDate?: Date;
  @property({type: Number}) today: Date = new Date();
  @property({type: Array}) reading: string = '';

  // async fetchDataFor(today: Date): Promise<[Date, string] | undefined> {
  //     var year = today.getFullYear();
  //     let data: string | undefined;
  //     for (var month = today.getMonth()+1;month>0; month--) {
  //       for (var day = today.getDate();day>0;day--) {
  //         data = await fetch(
  //           `/${year}/${month}/${day}.md`, 
  //           {
  //             method: 'GET', 
  //             redirect: 'error',
  //             headers: {
  //               'Content-Type': 'text/markdown',
  //               'Accept': 'text/markdown'
  //             }
  //           }
  //         ).then(res => res.ok ? res.text() : '');
  //         if (data) return [new Date(year, month-1, day), data];
  //       }
  //     }
  // }
  
  // protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
  //   if (_changedProperties.has("today")) {
  //     this.fetchDataFor(this.today).then((res) => {
  //       if (res) {
  //         let [date, data] = res;
  //         this.currentReadingDate = date;
  //         this.reading = data;
  //       }
  //     })
  //   }
  // }

  protected render() {
    return html`<bible-reading-history-button .date="${this.today}" @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
      this.currentReadingDate = event.detail.date;
      this.reading = event.detail.reading;
    }}"></bible-reading-history-button>
    <bible-questions>${unsafeHTML(this.reading)}</bible-questions>`
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
    'bible-reading': BibleReading;
    'bible-questions': BibleQuestions;
    'bible-reading-history-button': BibleReadingHistoryButton;
  } 
}