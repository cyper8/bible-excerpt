import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import './bible-questions.js';

@customElement('bible-reading')
export class BibleReading extends LitElement {
  
  @property({type: Date}) currentReadingDate?: Date;
  @property({type: Number}) today: Date = new Date();
  @property({type: Array}) reading: string = '';

  async fetchDataFor(today: Date): Promise<[Date, string] | undefined> {
      var year = today.getFullYear();
      let data: string | undefined;
      for (var month = today.getMonth()+1;month>0; month--) {
        for (var day = today.getDate();day>0;day--) {
          data = await fetch(
            `/${year}/${month}/${day}.md`, 
            {
              method: 'GET', 
              redirect: 'error',
              headers: {
                'Content-Type': 'text/markdown',
                'Accept': 'text/markdown'
              }
            }
          ).then(res => res.ok ? res.text() : '');
          if (data) return [new Date(year, month-1, day), data];
        }
      }
  }
  
  protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("today")) {
      this.fetchDataFor(this.today).then((res) => {
        if (res) {
          let [date, data] = res;
          this.currentReadingDate = date;
          this.reading = data;
        }
      })
    }
  }

  protected render() {
    return html`${this.currentReadingDate instanceof Date
    ? html`TODO: render month view for ${this.currentReadingDate.toLocaleDateString(window.navigator.language, {month: 'long'})} ${this.currentReadingDate}
    <bible-questions>${unsafeHTML(this.reading)}</bible-questions>`
    : nothing}`
  }

}