# Item List

A simple grid of item rows. Renders `item-card`s from a collection (`each="items"`); the
panel shows the expanded result.

## Example
```html
<div class="item-list">
  <article class="item-card">
    <h3 class="card-title">Read the architecture</h3>
    <span class="badge" data-status="active">Active</span>
    <button class="btn" data-size="sm" data-variant="outline">Archive</button>
  </article>
  <article class="item-card">
    <h3 class="card-title">Ship the POC</h3>
    <span class="badge" data-status="archived">Archived</span>
    <button class="btn" data-size="sm" data-variant="outline">Archived</button>
  </article>
</div>
```
