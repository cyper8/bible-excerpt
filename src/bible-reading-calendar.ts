import { LitElement, PropertyValueMap, css, html, nothing } from "lit";
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

const genMonth = (data:string[][], currentReadingDate: Date) => {
  const week = [
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
    "Нд",
  ];
  let month = currentReadingDate.getMonth();
  let year = currentReadingDate.getFullYear();
  let day1 = new Date(year, month, 1); 
  let offset = day1.getDay();
  let length = daysInMonth(month, year);
  //let mdata = Array<string>(offset).fill('').concat(...data[month]);
  let gen: (ReadingData | undefined)[][] = [];
  for (var w=0;w<Math.ceil((length+offset-1)/7); w++) {
    gen[w]=[];
    for (var d=0;d<7;d++) {
      let id = (w*7+d)-offset+1;
      gen[w][d]= (id>=0 && data[month] && data[month][id]) ? {
        date: new Date(year, month, id+1),
        reading: data[month][id]
      } : undefined;
    }
  }
  
  return html`<table>
  <thead><tr>${week.map(d => html`<th>${d}</th>`)}</tr></thead>
  <tbody>
    ${gen.map((w,wn) => html`<tr class="week" id="week${wn}">${
      w.map((d,dn) => {
        let date = (wn*7+dn+1)-(offset-1)
        return html`<td class="day" id="day${dn}" alt="${d?.reading}">${date>0?date+'':''}</td>`
      })
    }</tr>`)}
  </tbody>
  </table>`
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
            readingData[month][day-1] = rData;
            if (rData && !reportedFlag) {
              reportedFlag = true;
              this.currentReadingDate = new Date(year, month, day);
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
      ${(this.currentReadingDate || this.date).toLocaleDateString(
        navigator.language,
        {dateStyle: 'long'}
      )}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.currentReadingDate ? genMonth(this.monthReading, this.currentReadingDate): nothing}
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
      width: auto;
      height: auto;
      background-color: #eee;
      color: #242424;
      border-radius: 1em;
    }
    input#date-selector-switch:checked+.date-selector {
      display: block
    }
    `
  }

}