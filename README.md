# 📄 11ty Template - Sensible Defaults

Simple and easy to use 11ty template.

## ✨ Features

- HTML/CSS minification
- [SCSS/SASS](https://sass-lang.com/)
- [HJSON](https://hjson.github.io/)
- Clear naming
- Auto-generated layout aliases
- Excerpts (using `<<<`)


## 🚀 Getting Started

1. Use Node v18.17.1
2. Run `npm install`
3. Run `npm start`
4. Visit `localhost:8080` in your browser
5. Edit `src/index.html`

---

Most of the time, `npm start` will suffice, but there
are other commands you may find useful:

- `npm run build`: Builds the website and compiles SASS/SCSS
- `npm run clean`: Wipes the generated website (`rm -rf public/*`)
- `npm run watch:11ty`: Starts just the dev server (no SASS/SCSS)
- `npm run watch:sass`: Starts SASS compiler in watch mode (compile on the fly)
- `npm run build:11ty`: Builds the website (no SASS/SCSS)
- `npm run build:sass`: Generates CSS from SASS/SCSS

## 🔧 Customization

Some options may be considered opinionated, so
I highly encourage you to customize things!

### Excerpt separator

Search for `setFrontMatterParsingOptions` inside
`eleventy.config.js` and you will find the following
code:

```js
cfg.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<<<",
});
```

you may toggle excerpts off, or change the separator to
the desired string, for instance, `---excerpt---`:

```js
cfg.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "---excerpt---",
});
```

### Default template engine

Search for `Nunjucks all the way!` inside
`eleventy.config.js` and you will see the following code:

```js
// Nunjucks all the way!
markdownTemplateEngine: "njk",
dataTemplateEngine: "njk",
htmlTemplateEngine: "njk",
```

As you might've guessed, you have to change `njk` to your
desired template engine's file extension (e.g. `liquid`).

Here's a list of template engines that are supported:

- Nunjucks (*.njk)
- Handlebars (*.hbs)
- Liquid (*.liquid)
- EJS (*.ejs)
- HAML (*.haml)
- Pug (*.pug)
- JavaScript (*.11ty.js)

**NOTE:** JavaScript (*.11ty.js)
currently doesn't work as intended with generative
aliases, so instead of writing

```yaml
---
layout: my-layout
---
```

you have to write

```yaml
---
layout: my-layout.11ty
---
```
