import { LitElement, css, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

declare interface Verse {
  pk: number;
  translation: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

declare type Verses = Verse[];

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  @property({ type: Number }) book: number = 1;
  @property({ type: Number }) chapter: number = 1;
  @property({ type: Array }) verses: number[] = [1, 2, 3];
  @state()
  text: Verses = [];

  updated(_changes: PropertyValues<BibleExcerpt>) {
    if (this.book && this.chapter && this.verses.length) {
      fetch(`https://bolls.life/get-verses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translation: 'UBIO',
          book: this.book,
          chapter: this.chapter,
          verses: this.verses,
        }),
      })
        .then<Verses>((res) => res.json())
        .then((text) => {
          this.text = text;
        })
        .catch(console.error);
    }
  }

  render() {
    return html`${this.text.map(
      (verse) => html`<p>${verse.verse}: ${verse.text}</p>`
    )}`;
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
