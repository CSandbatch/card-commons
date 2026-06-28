# Card Commons

**Make a card, not a website.**

Card Commons is an open specification for portable, editable, publishable,
playable web objects. A card can stand alone at a URL, join a stack, become an
episode in a series, act as a game piece, or be remixed into a new system
without collapsing into a flat image.

This repository is a publication and engineering-handoff package. It contains
the product requirements, protocol model, JSON Schemas, an OpenAPI contract, a
whitepaper, and a web-native pitch deck. It does **not** contain the product
application.

## Start here

- [Executive brief](docs/00-executive-brief.md)
- [Product requirements](docs/01-product-requirements.md)
- [Card protocol and domain model](docs/02-card-protocol-and-domain-model.md)
- [System architecture](docs/03-system-architecture.md)
- [Whitepaper](whitepaper/card-commons.md)
- [Research and claim ledger](research/claims.md)

## Core invariant

> A card is a portable, editable, publishable, playable web object.

Structured fields express what a card means. Layers express how a card looks.
Surfaces adapt the same card to card, thumbnail, public, game, print, and
social contexts. Revisions preserve history; publications pin stable public
views; collections and games give cards context and behavior.

## MVP

The first product proves four loops:

1. Create a structured card from a template.
2. Arrange cards into a stack, deck, or series.
3. Publish a card or collection at a stable URL.
4. Build and play a prompt-response game, then remix it non-destructively.

Custom domains, a universal game engine, a marketplace, deep social
networking, and advanced ontology editing are explicitly deferred.

## Development

Requirements: Node.js 22+ and npm 10+.

```bash
npm install
npm run dev
npm run check
```

The site is a statically exported Next.js application designed for GitHub
Pages. Its narrative pages render the canonical repository Markdown rather
than maintaining duplicate prose.

## Status

Version `0.1.0` is a proposal intended for engineering review, prototyping,
user research, and protocol discussion. Normative language in the protocol
specification uses **MUST**, **SHOULD**, and **MAY** in their ordinary
requirements sense; it is not yet an internet standard.

## Licensing

- Software: [MIT](LICENSE)
- Prose, diagrams, and other content: [CC BY 4.0](LICENSE-CONTENT.md)

