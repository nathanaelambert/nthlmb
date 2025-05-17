export class Point2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  // Returns true if this point is inside the given rectangle (not on the edge)
  isInside(rect) {
    return (
      this.x > rect.x1 &&
      this.x < rect.x2 &&
      this.y > rect.y1 &&
      this.y < rect.y2
    );
  }
}
  
// Rectangle class defined by four coordinates
export class Rectangle {
  constructor(x1, y1, x2, y2) {
    // (x1, y1) is top-left, (x2, y2) is bottom-right
    this.x1 = Math.min(x1, x2);
    this.y1 = Math.min(y1, y2);
    this.x2 = Math.max(x1, x2);
    this.y2 = Math.max(y1, y2);
  }

  // Returns all four corners as Point2D objects
  corners() {
    return [
      new Point2D(this.x1, this.y1),
      new Point2D(this.x2, this.y1),
      new Point2D(this.x2, this.y2),
      new Point2D(this.x1, this.y2)
    ];
  }
}

// Helper: clamp value between min and max
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Returns the closest point on the rectangle's surface to the target point
export function closestPointOnRectangle(rect, target) {
  // Clamp the target point to the rectangle bounds
  let x = clamp(target.x, rect.x1, rect.x2);
  let y = clamp(target.y, rect.y1, rect.y2);

  // If the point is inside the rectangle, project to the closest edge
  if (target.x > rect.x1 && target.x < rect.x2 &&
      target.y > rect.y1 && target.y < rect.y2) {
    // Find distances to each edge
    const left   = target.x - rect.x1;
    const right  = rect.x2 - target.x;
    const top    = target.y - rect.y1;
    const bottom = rect.y2 - target.y;
    const minDist = Math.min(left, right, top, bottom);
    if (minDist === left)    x = rect.x1;
    else if (minDist === right) x = rect.x2;
    else if (minDist === top)   y = rect.y1;
    else if (minDist === bottom) y = rect.y2;
  }
  return new Point2D(x, y);
}

// Returns the furthest point on the rectangle's surface from the target point
export function furthestPointOnRectangle(rect, target) {
  // The furthest point will always be one of the corners
  const corners = rect.corners();
  let maxDist = -Infinity;
  let furthest = null;
  for (const corner of corners) {
    const dx = corner.x - target.x;
    const dy = corner.y - target.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDist) {
      maxDist = distSq;
      furthest = corner;
    }
  }
  return furthest;
}
