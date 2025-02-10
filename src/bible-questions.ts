import { LitElement, PropertyValueMap, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "./bible-excerpt.js";

@customElement('bible-questions')
export class BibleQuestions extends LitElement {

  @property({ type: Object }) content?: TemplateResult;

  private incertExcerpts(): void {
    let headers = this.shadowRoot?.querySelectorAll('h1');
    headers?.forEach(header => {
      let refText = header.textContent;
      if (refText) {
        let ref = refText.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
        let book = refText.replace(ref, '').trim();
        let [chapter, verses] = ref.split(':',2);
        let excerpt = document.createElement('bible-excerpt');
        excerpt.setAttribute('book', book);
        excerpt.setAttribute('chapter', chapter);
        if (verses) excerpt.setAttribute("verses", verses);
        header.replaceWith(excerpt);
        //tempRoot.appendChild(excerpt);
      }
    })
  }

  connectedCallback(): void {
    super.connectedCallback();
    Promise.resolve(marked.parse(this.innerHTML))
    .then(htm => this.content = html`${unsafeHTML(htm)}`)
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('content')) {
      this.incertExcerpts();
    }
  }

  protected render() {
    return html`${this.content}`
  }
}