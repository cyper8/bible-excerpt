import { LitElement, PropertyValueMap, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "./bible-excerpt.js";
import "./bible-reading-calendar.js";
import { BibleReadingCalendar, ReadingDateSelectedEvent } from "./bible-reading-calendar.js";
import { BibleExcerpt } from "./bible-excerpt.js";

@customElement('bible-reading')
export class BibleReading extends LitElement {

  @state() book: string = '';
  @state() chapter: string = '';
  @state() verses: string = '';

  @property({type: String}) translation: string = 'UBIO';
  @property({type: String}) content: string = '';

  private processContent() {
    if (this.shadowRoot) {
      let header = this.shadowRoot.querySelector('h1');
      if (header) {
        let refText = header.textContent;
        if (refText) {
          let ref = refText.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
          this.book = refText.replace(ref, '').trim();
          [this.chapter, this.verses] = ref.split(':',2);
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
                  let excerpt = this.shadowRoot?.querySelector('bible-excerpt');
                  if (excerpt)
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
    return html`<bible-reading-calendar @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
                  this.content = event.detail.reading;
                }}"></bible-reading-calendar>${
      this.book && this.chapter
      ? html`
        <bible-excerpt
          translation="${this.translation}" 
          book="${this.book}" 
          chapter="${this.chapter}" 
          verses="${this.verses || ''}">
        </bible-excerpt>`
      : nothing
    }${unsafeHTML(this.content)}`
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

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
    'bible-reading': BibleReading;
    'bible-reading-calendar': BibleReadingCalendar;
  } 
}