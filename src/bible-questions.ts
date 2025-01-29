import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";
import { marked } from "marked";

@customElement('bible-questions')
export class BibleQuestions extends LitElement {
  @property({type: String}) rawContent: string = this.innerHTML;
  @state()
  private selectVerses: string = '';
  private book: string = '';
  private chapter: number = 0;

  connectedCallback(): void {
    let tempRoot = document.createElement('div');
    Promise.resolve(marked.parse(this.rawContent))
    .then(html => {
      tempRoot.innerHTML = html;
      let header = tempRoot.querySelector('h1');
      header?.textContent?.split(',')
      .reduce((refs, chunk, i, a) => {
        let chapts = chunk.trim().match(/[0-9, :-]+$/)?.[0];
        let book = chunk.trim().replace(chapts || '', '');
        
      })
    })
  }

  protected render() {
    return html`${until(Promise.resolve(marked.parse(this.rawContent)).then(html => unsafeHTML(html)), this.rawContent)}`
  }
}