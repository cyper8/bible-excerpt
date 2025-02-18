import { LitElement, PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "./bible-excerpt.js";

@customElement('bible-questions')
export class BibleQuestions extends LitElement {
  @property({ type: String }) date: string = (new Date()).toISOString();
  @property({ type: String }) reading: string = '';
  @property({ type: String }) questions: string = '';
  @state() content?: TemplateResult;
  @state() readingRefs: string[] = [];
  @state() hilight?: string;

  connectedCallback(): void {
    super.connectedCallback();
    Promise.resolve(marked.parse(this.innerHTML))
    .then(htm => this.content = html`${unsafeHTML(htm)}`)
  }

  protected updated(_changedProperties: PropertyValueMap<this>): void {
    if (_changedProperties.has("reading")) {
      if (this.reading) {
        let ref = this.reading.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
        let book = this.reading.replace(ref, '').trim();
        this.readingRefs = [book, ...ref.split(':',2)]
      }
    }
    if (_changedProperties.has("questions")) {
      Promise.resolve(marked.parse(this.questions))
      .then(htm => this.content = html`${unsafeHTML(htm)}`)
    }
  }

  protected render() {
    return html`
    <h3>${this.date}</h3>
    ${this.readingRefs.length 
    ?  html`<bible-excerpt book="${this.readingRefs[0]}" chapter="${this.readingRefs[1]}" verses="${this.readingRefs[2]}"></bible-excerpt>`
    :  nothing
    }
    ${this.content}`
  }
}