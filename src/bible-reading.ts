import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import './bible-questions.js';

declare interface Reading {
  date: number
  reading: string
  questions: string
}

declare type ReadingData = Array<Array<Reading>>;

@customElement('bible-reading')
export class BibleReading extends LitElement {
  @state() currentReading?: Reading;
  @state() currentReadingDate?: Date;
  @property({type: Number}) today: Date = new Date();
  @property({type: Array}) reading: ReadingData = [];

  async fetchData() {
      var year = this.today.getFullYear();
      let data: string | undefined;

      for (var month = this.today.getMonth()+1;month>0; month--) {
        for (var day = this.today.getDate();day>0;day--) {
          data = await fetch(`${year}/${month}/${day}`).then(res => res.ok ? res.text() : '');
          if (data) return data;
        }
      }
      
  }
  
  protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("today")) {
      
      // fetch(`${}/${}/`)
      // .then(res => res.json())
      // .then(data => {
      //   if (data instanceof Array &&
      //     data.length > 0 &&
      //     data[0] instanceof Array &&
      //     typeof data[0][0] === 'object')
      //   this.reading = data as ReadingData;
      // })
      // .catch(console.log)
    }
    if (_changedProperties.has("reading") && this.reading.length) {
      let month = Math.min(this.today.getMonth(),this.reading.length-1);
      let mthread = this.reading[month];
      if (mthread.length) {
        let tday = this.today.getDate();
        for (var i=mthread.length-1;mthread[i].date-tday>0;i--);
        this.currentReading = mthread[i];
        this.currentReadingDate = new Date(this.today,month,this.currentReading.date);  
      } else {
        console.error(`No readings for the current month (${month+1})`);
      }
    }
  }

  protected render() {
    return html`${this.currentReadingDate instanceof Date
    ? html`TODO: render month view for ${this.currentReadingDate.toLocaleDateString(window.navigator.language, {month: 'long'})} ${this.today}`
    : nothing}
    ${this.currentReading
    ? html`<bible-questions 
    date="${this.currentReading.date}" 
    reading="${this.currentReading.reading}" 
    questions="${this.currentReading.questions}">
    </bible-questions>`
    : nothing}`
  }

}