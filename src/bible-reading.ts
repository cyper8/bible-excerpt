import { LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

declare interface Reading {
  date: number
  reading: string
  questions: string
}

declare type ReadingData = Array<Array<Reading>>;

@customElement('bible-reading')
export class BibleReading extends LitElement {
  @state() today: Date = new Date();
  @state() currentReading?: Reading;
  @state() currentReadingDate?: Date;
  @property({type: Number}) year: number = this.today.getFullYear();
  @property({type: Array}) reading: ReadingData = [];
  
  protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("year")) {
      fetch(`/${this.year}.json`)
      .then(res => res.json())
      .then(data => {
        if (data instanceof Array &&
          data.length > 0 &&
          data[0] instanceof Array &&
          typeof data[0][0] === 'object')
        this.reading = data as ReadingData;
      })
      .catch(console.log)
    }
    if (_changedProperties.has("reading") && this.reading.length) {
      let month = Math.min(this.today.getMonth(),this.reading.length-1);
      let mthread = this.reading[month];
      let tday = this.today.getDate();
      for (var i=mthread.length-1;mthread[--i].date-tday<0;);
      this.currentReading = mthread[i];
      this.currentReadingDate = new Date(this.today.getFullYear(),month,this.currentReading.date);
    }
  }
}