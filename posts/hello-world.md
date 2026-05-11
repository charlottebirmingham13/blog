# Hello, world

A first entry. The site is built with nothing but HTML, CSS, and a small amount of
JavaScript — no static-site generator, no framework, no build step. Markdown files
live in `posts/` and are rendered in the browser when a page loads.

## What this is

A quiet corner. Short notes, occasional longer pieces, and posts that mix English
and Persian — sometimes in the same paragraph. No comments, no tracking, no
accounts. Just a folder of `.md` files and a manifest.

## How posts work

Each post is a markdown file. The list on the homepage is built from
`posts/index.json`, which records the slug, title, date, and a short excerpt.

```js
fetch('posts/index.json')
  .then(r => r.json())
  .then(renderList);
```

That's the whole machinery. Adding a post means dropping a markdown file in
`posts/` and adding an entry to the manifest.

> The goal is to write more and tinker with the site less.

More soon.
