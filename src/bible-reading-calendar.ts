import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export declare interface ReadingData {
  date: Date;
  reading: string;
}

export declare type ReadingDateSelectedEvent = CustomEvent<ReadingData> & {
  type: 'reading-date-selected'
}

export const daysInMonth = (m0: number, y?: number) => {
  let d = new Date();
  d.setFullYear(y || d.getFullYear())
  d.setMonth(m0+1);
  d.setDate(0);
  return d.getDate()
}

@customElement('bible-reading-calendar')
export class BibleReadingCalendar extends LitElement {

  @state() monthReading: string[][] = [];
  @state() currentReadingDate?: Date;
  @property({type: Date}) date: Date = new Date();

  async fetchDataFor(thedate: Date): Promise<string[][]> {
    var readingData:string[][] = [],
      reportedFlag: boolean = false,
      theyear = thedate.getFullYear(),
      themonth = thedate.getMonth(),
      theday = thedate.getDate(),
      year = theyear,
      month = themonth;
    
    for (;year>theyear-1;year--) {
      if (reportedFlag) break;
      for (;month>0; month--) {
        if (reportedFlag) break;
        readingData[month] = [];
        var day = (month<themonth || year<theyear) ? daysInMonth(month, year) : theday;
        for (;day>0;day--) {
          await fetch(
            `/${year}/${month+1}/${day}.md`, 
            {
              method: 'GET', 
              redirect: 'error',
              headers: {
                'Content-Type': 'text/markdown',
                'Accept': 'text/markdown'
              }
            }
          ).then(res => {
            if (res.ok) {
              return res.text()
            } else return ''
          })
          .then(rData => {
            readingData[month][day] = rData;
            if (rData && !reportedFlag) {
              reportedFlag = true;
              this.currentReadingDate = new Date(year, month-1, day);
              this.dispatchEvent(new CustomEvent<ReadingData>('reading-date-selected', {
                detail: {
                  date: this.currentReadingDate,
                  reading: rData
                }
              }) as ReadingDateSelectedEvent)
            }
          });
          
        }
      }
    }
    return readingData
  }
  
  protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("date")) {
      this.fetchDataFor(this.date).then((res) => {
        if (res) {
          this.monthReading = res
        }
      })
    }
  }

  protected render() {
    return html`
    <label class="icon" id="clock" for="date-selector-switch">
      ${this.date.toLocaleDateString(
        navigator.language,
        {dateStyle: 'long'}
      )}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.monthReading}
      </div>
    </label>
    
    `
  }

  static get styles () {
    return css`
    :host {
      display: inline-block;
      margin: 0.2em;
      padding: 0.2em;
      border: solid 1px #eee;
      border-radius: 1.2em;
      color: #eee;
      line-height: 2em
    }
    #clock.icon {
      position: relative
    }
    #clock.icon::before {
      content: '';
      margin: 0.2em;
      display: block;
      float: left;
      width: 1.5em;
      height: 1.5em;
      border: solid 0.1px #eee;
      border-radius: 50%;
      background-color: #eee;
      position: relative;
    }
    #clock.icon::after {
      content: '';
      width: 0;
      height: 0.5em;
      border: solid 0.05em #242424;
      border-radius: 0.05em;
      position: absolute;
      left: -1.05em;
      top: 0.05em;
      transform-origin: center bottom;
      transform: rotate(35deg);
      transition: transform 2s linear;
    }
    #clock.icon:hover::after {
      transform: rotate(-360deg)
    }
    .date-selector {
      display: none;
      position: absolute;
      width: 7em;
      height: 9em;
      background-color: #eee;
      border-radius: 1em;
    }
    input#date-selector-switch:checked+.date-selector {
      display: block
    }
    `
  }

}