import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "./bible-excerpt.js";
import { BibleExcerpt } from "./bible-excerpt.js";

@customElement('bible-questions')
export class BibleQuestions extends LitElement {
  @property({type: String}) content: string = '';

  private processContent() {
    if (this.shadowRoot) {
      var excerpt: BibleExcerpt;
      let header = this.shadowRoot.querySelector('h1');
      if (header) {
        let refText = header.textContent;
        if (refText) {
          let ref = refText.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
          let book = refText.replace(ref, '').trim();
          let [chapter, verses] = ref.split(':',2);
          excerpt = document.createElement('bible-excerpt') as BibleExcerpt;
          excerpt.setAttribute('book', book);
          excerpt.setAttribute('chapter', chapter);
          if (verses) excerpt.setAttribute("verses", verses);
          header.replaceWith(excerpt);
          var node: Text, textIterator = document.createNodeIterator(
            this.shadowRoot, 
            NodeFilter.SHOW_TEXT, 
            (node: Node) => {
              let search = node.textContent?.match(/([0-9,іта -]*вірш[^)\s]*[0-9,іта -]*)/gmi);
              if (search?.length) {
                return NodeFilter.FILTER_ACCEPT
              } else {
                return NodeFilter.FILTER_REJECT
              }
            }
          );
          while (node = textIterator.nextNode() as Text) {
            if (node.parentElement?.className.includes('ref-verses')) continue;
            var refs = node.textContent?.matchAll(/([0-9,іта -]*вірш[^)\s]*[0-9,іта -]*)/gmi);
            if (refs) {
              for (const match of refs) {
                let ref = node.splitText(match.index);
                let rest = ref.splitText(match[0].length);
                let u = document.createElement('u');
                u.appendChild(ref);
                node.parentElement?.insertBefore(u,rest);
                u.className="ref-verses";
                let vs = match[0].match(/[0-9-]+/g)?.filter(v => v).join(',');
                u.addEventListener('click', (_event) => {
                  excerpt.hilightVerses = excerpt.hilightVerses ? '' : vs || '';
                })
              }
            }
          }
        }
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.content = marked.parse(this.innerHTML, {async: false});
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("content")) {
      if (this.content) {
        this.content = marked.parse(this.content, {async: false});
      }
    }
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("content")) {
      if (this.content) {
        this.processContent();
      }
    }
  }

  protected render(): unknown {
    return html`${unsafeHTML(this.content)}`
  }

  static get styles() {
    return css`
    :host {
      display: block
    }
    .ref-verses {
      color: #59f;
      cursor: pointer;
    }
    `
  }

}