import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { until } from 'lit/directives/until.js';

const TRANSLATIONS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/translations_books.json';

declare interface BVerse {
  pk: number;
  chapter: number;
  verse: number;
  text: string;
}

declare interface BSingleVerse extends BVerse {
  translation: string;
  book: number;
}

declare interface BChapterVerse extends BVerse {
  comment?: string;
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

declare type BChapterVerses = BChapterVerse[];

const spreadNumbers = (numlist: string, length?: number) => numlist.split(',')
  .reduce((numRanges: number[], entry) => {
    let boundaries = entry.trim().split('-');
    let first = parseInt(boundaries[0]) || 1;
    let last = parseInt(boundaries[boundaries.length-1]) || length || first;
    while (entry && first <= last) {
      numRanges.push(first++);
    } 
    return numRanges;
  }, []);

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  static bBible = Promise.all([
    fetch(TRANSLATIONS_ENDPOINT).then<BLanguages>(res => res.json()),
    fetch(BOOKS_ENDPOINT).then<BBooks>(res => res.json())
  ]);
  @property({ type: Boolean }) selectTranslation: boolean = false;
  @property({ type: String }) translation: string = 'UBIO';
  @property({ type: String }) book: string = 'Буття';
  @property({ type: Number }) chapter: string = '3';
  @property({ type: String }) verses: string = '';
  @property({ type: String }) hilightVerses: string = '';

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

  private bChapterVerse(verse: BChapterVerse) {
    let hilighted = this.hilightVerses ? spreadNumbers(this.hilightVerses) : [];
    return html`<input type=radio name="note" id="verse${verse.verse}" class="note" />
    <label for="verse${verse.verse}">
      <p 
      class="${classMap({verse: true, hilight: hilighted.includes(verse.verse)})}"
      pk="${verse.pk}" 
      chapter="${verse.chapter}" 
      num="${verse.verse}"
      >
          ${verse.text}
          ${verse.comment 
            ? html`<b>&darr;</b>  
            <span class="comment">
            <hr />
              ${unsafeHTML(verse.comment)}
            </span>` 
            : nothing}
      </p>
    </label>`
  }

  render() {
    return html`
    ${until(BibleExcerpt.bBible.then(([langs, books]) => html`
    <h5>${this.book} ${this.chapter}${this.verses ? `:${this.verses}` : ''}</h5>
    ${this.selectTranslation ? this.renderManualModeControls(langs) : nothing}
    `))}
    ${until(
      BibleExcerpt.bBible.then(([_langs, books]) => 
      {
        if (this.translation in books) {
          let booknum = books[this.translation].findIndex(book => book.name === this.book)+1;
          if (booknum)
            return fetch(
              `https://bolls.life/get-chapter/${this.translation}/${booknum}/${this.chapter}/`,
              {
                method: 'GET',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json', }
              }
            )
              .then<BChapterVerses>((res) => res.json())
              .then(verses =>
                spreadNumbers(this.verses ? this.verses : "1-", verses.length)
                  .map(vnum => verses[vnum - 1])
                  .map(verse => this.bChapterVerse(verse)))
              .catch(console.error);
            else return [html`помилка запиту`]
        } else {
          return [html`Помилка: перекладу не знайдено`]
        }
      }),
      html`Завантаження...`
    )}`;
  }

  static styles = css`
  * {box-sizing: border-box}
  :host {
    padding: 2.5em;
    margin: 1em;
    border: solid 1px #555;
    border-radius: 0.5em;
  }
  .verse::before {
    content: attr(num);
    margin-right: 0.5em;
    font-size: 70%;
    font-weight: 700
  }
  .verse {
    max-width: 50em;
    margin: 0.2em 0;
  }
  input.note {
    display: none
  }
  .verse.hilight {
    background-color: #765;
  } 
  .verse:hover {
    background-color: #555;
  }
  span.comment {
    display: none;
    background: #eee;
    color: black;
    position: fixed;
    left: 0px;
    height: auto;
    width: 100%;
    bottom: 0px;
    overflow: hidden;
    padding: 1em;
  }

  input:checked+label span.comment {
    display: inline-block;
  }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
