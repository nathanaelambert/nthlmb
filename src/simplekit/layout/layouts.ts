import { BoundingBox } from "../utility/boundingbox";
import { SKElement } from "../widget/element";

export type Size = { width: number; height: number };

export type LayoutMethod = (size: Size, elements: SKElement[]) => Size;

export function rowLayout(
  { width, height }: Size,
  elements: SKElement[]
): Size {
  const padding = 10;
  let x = padding;
  let y = padding;
  let rowHeight = 0;

  const areaUsed: Size = { width: 0, height: 0 };

  for (const el of elements) {
    el.x = x;
    el.y = y;
    rowHeight = Math.max(rowHeight, el.height);
    x += el.width + padding;
  }

  return areaUsed;
}

export function rowWrapLayout(
  { width, height }: Size,
  elements: SKElement[]
): Size {
  const padding = 10;
  let x = padding;
  let y = padding;
  let rowHeight = 0;

  const areaUsed: Size = { width: 0, height: 0 };

  elements.forEach((el, i) => {
    if (i > 0 && x + el.width > width) {
      x = padding;
      y += rowHeight + padding;
      rowHeight = 0;
    }

    el.x = x;
    el.y = y;
    rowHeight = Math.max(rowHeight, el.height);
    x += el.width + padding;

    areaUsed.width = Math.max(areaUsed.width, x);
    areaUsed.height = Math.max(areaUsed.height, y + rowHeight);
  });

  areaUsed.height += padding;

  return areaUsed;
}

// TODO this doesn't work
export function rowGrowLayout(
  { width, height }: Size,
  elements: SKElement[]
): Size {
  const gap = 10;
  let x = gap;
  let y = gap;
  let rowHeight = 0;

  const areaUsed: Size = { width: 0, height: 0 };

  // get min, preferred, and max widths
  const min = elements.reduce((a, v) => a + v.minWidth, 0);
  const pref = elements.reduce((a, v) => a + v.width, 0);
  const max = elements.reduce((a, v) => a + v.maxWidth, 0);
  //   return { min: a.min + v.minWidth, max: a.max + v.maxWidth }
  // },
  //     { min: 0, max: 0 }
  //   ); // pref: 0, max: 0 })

  if (min >= width) {
    for (const el of elements) {
      el.x = x;
      el.y = y;
      rowHeight = Math.max(rowHeight, el.height);
      x += el.minWidth + gap;
    }
  } else if (pref >= width) {
    const prefMargin = pref - min;
    const fraction = (width - min) / prefMargin;
    for (const el of elements) {
      el.x = x;
      el.y = y;
      rowHeight = Math.max(rowHeight, el.height);
      x += el.minWidth + fraction * (el.width - el.minWidth) + gap;
    }
  } else {
    const maxMargin = max - pref;
    const fraction = (width - pref) / maxMargin;
    for (const el of elements) {
      el.x = x;
      el.y = y;
      rowHeight = Math.max(rowHeight, el.height);
      const w = el.width + fraction * (el.width - el.minWidth);
      el.width = w;
      x += w + gap;
    }
  }

  return areaUsed;
}
