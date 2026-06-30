# App Header

Shared masthead bar across pages. The `active` prop (here `data-active`) highlights the
current page — no per-link logic in the markup. Uses a continuous `view-transition-name`
so it morphs instead of cross-fading on navigation.

## States

### On the AI-loop page
```html
<header class="app-header" data-active="loop">
  <span class="brand">BATCH</span>
  <nav>
    <a href="/home">Items</a>
    <a href="/loop">AI loop</a>
    <a href="/about">About</a>
    <a href="/catalog">Catalog</a>
  </nav>
</header>
```

### On the Items page
```html
<header class="app-header" data-active="items">
  <span class="brand">BATCH</span>
  <nav>
    <a href="/home">Items</a>
    <a href="/loop">AI loop</a>
    <a href="/about">About</a>
    <a href="/catalog">Catalog</a>
  </nav>
</header>
```
