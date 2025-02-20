import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export declare interface BibleReadingData {
  date: Date;
  reading: string;
}

export declare type ReadingDateSelectedEvent = CustomEvent<BibleReadingData> & {
  type: 'reading-date-selected'
}

// type BibleReadingHistoryButtonEventMap = HTMLElementEventMap & {
//   'reading-date-selected': ReadingDateSelectedEvent
// }

@customElement('bible-reading-history-button')
export class BibleReadingHistoryButton extends LitElement {

  // addEventListener<K extends keyof BibleReadingHistoryButtonEventMap>(type: K, listener: (this: HTMLElement, ev: BibleReadingHistoryButtonEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
  // addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void {
  //   super.addEventListener(type, listener, options);
  // }

  @state() monthReading: string[][] = [];
  @state() currentReadingDate?: Date;
  @property({type: Date}) date: Date = new Date();

  protected render() {
    return html`
    <label class="icon" id="clock" for="date-selector-switch">${this.date.toLocaleDateString(
      navigator.language,
      {dateStyle: 'long'}
    )}</label>
    <input type=checkbox id="date-selector-switch" hidden />
    <div class="date-selector">

    </div>
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
      background-color: #242424;
      position: relative;
    }
    #clock.icon::after {
      content: '';
      width: 0;
      height: 0.5em;
      border: solid 0.05em #eee;
      border-radius: 0.05em;
      position: absolute;
      left: -1.05em;
      top: 0.05em;
      transform-origin: center bottom;
      transform: rotate(35deg);
    }
    .date-selector {
      display: none;
      position: absolute;
      width: 7em;
      height: 9em;
      background-color: #eee;
      border-radius: 1em;
    }
    input#date-selector-switch[checked]+.date-selector {
      display: block
    }
    `
  }

}