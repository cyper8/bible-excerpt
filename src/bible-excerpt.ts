import { LitElement, css, html, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

const TRANSLATIONS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/translations_books.json';

declare interface BVerse {
  pk: number;
  translation: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

declare interface BTranslation {
  short_name: string
  full_name: string
  commentaries?: boolean
  updated: number
  info?: string
  dir?: 'rtl' | 'ltr'
}

declare interface BLanguage {
  language: string,
  translations: BTranslation[]
}

declare interface BBook {
  bookid: number
  chronorder: number
  name: string
  chapter: number
}

declare type BLanguages = BLanguage[];

declare type BBooks = {
  [translation in BTranslation["short_name"]]: BBook[]
}

declare type BVerses = BVerse[];

const spreadNumbers = (numlist: string) => numlist.split(',')
  .reduce((numRanges: number[], entry) => {
    let boundaries = entry.trim().split('-');
    let first = parseInt(boundaries[0].trim());
    let last = parseInt(boundaries[boundaries.length - 1].trim());
    while (first < last) {
      numRanges.push(first++);
    }
    numRanges.push(parseInt(boundaries[boundaries.length - 1].trim()));
    return numRanges;
  }, []);

const bibleVerse = (verse: BVerse) => html`<p class="verse" pk="${verse.pk}" chapter="${verse.chapter}" num="${verse.verse}">${verse.text}</p>`;

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  static bBible = Promise.all([
    fetch(TRANSLATIONS_ENDPOINT).then<BLanguages>(res => res.json()),
    fetch(BOOKS_ENDPOINT).then<BBooks>(res => res.json())
  ]);
  @property({ type: Boolean }) manual: boolean = false;
  @property({ type: String }) translation: string = 'UBIO';
  @property({ type: String }) book: number = 43;
  @property({ type: Number }) chapter: number = 3;
  @property({ type: String }) verses: string = '16';

  private renderManualModeControls(langs: BLanguages) {
    return html`<select id="translations" name="translations" @change=${(e: Event) => { let selector = e.target as HTMLSelectElement; this.translation = selector.value }}>
      ${langs.map(lang =>
      lang.translations
        .map(translation =>
          html`<option class="translation" 
            value="${translation.short_name}" 
            ?selected="${translation.short_name === this.translation}">
              ${lang.language} --- ${translation.short_name} --- ${translation.full_name}
            </option>`))}
  </select>`
  }

  render() {
    return html`${until(BibleExcerpt.bBible.then(([langs, books]) => {
      if (this.manual) return this.renderManualModeControls(langs)
    }))}
    ${until(
      BibleExcerpt.bBible.then(([_langs, books]) => {
        if (this.translation in books) {
          return fetch(
            `https://bolls.life/get-chapter/${this.translation}/${this.book}/${this.chapter}/`,
            {
              method: 'GET',
              mode: 'cors',
              headers: { 'Content-Type': 'application/json', }
            }
          )
            .then<BVerses>((res) => res.json())
            .then(verses =>
              spreadNumbers(this.verses)
                .map(vnum => verses[vnum - 1])
                .map(verse => bibleVerse(verse)))
            .catch(console.error);
        } else {
          return [html`Помилка: перекладу не знайдено`]
        }
      }),
      html`Завантаження...`
    )}`;
  }

  static styles = css`
  :host {
    padding: 0.5em;
  }
  .verse::before {
    content: attr(num);
    margin-right: 0.5em;
    font-size: 70%;
    font-weight: 700
  }
  .verse {
    margin: 0.5em 0;
  }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
