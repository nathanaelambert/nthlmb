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
  // Returns the Euclidean distance to another Point2D
  distanceTo(point2D) {
    return Math.hypot(this.x - point2D.x, this.y - point2D.y);
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
  area() {
    const width = this.x2 - this.x1;
    const height = this.y2 - this.y1;
    return width * height;
  }
}

export class Path2D {
  constructor(points = []) {
    // points: array of Point2D
    this.points = points;
  }

  // Adds a point to the path
  addPoint(point) {
    this.points.push(point);
  }

  // Returns the total length of the path (sum of segment lengths)
  totalLength() {
    let length = 0;
    for (let i = 1; i < this.points.length; i++) {
      length += Path2D.distance(this.points[i - 1], this.points[i]);
    }
    return length;
  }

  // Returns the length of the first segment (between first and second point)
  firstSegmentLength() {
    if (this.points.length < 2) return 0;
    return Path2D.distance(this.points[0], this.points[1]);
  }

  // Static helper to calculate distance between two points
  static distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
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


export function sliceInTwo(rect, target) {
  // Find the closest point on the rectangle to the target
  const start = closestPointOnRectangle(rect, target);

  // Get the rectangle's corners in order: top-left, top-right, bottom-right, bottom-left
  const corners = rect.corners();

  // Helper to find which edge the start point is on, and its position along the perimeter
  function findEdgeAndPosition(point) {
    const { x, y } = point;
    const { x1, y1, x2, y2 } = rect;
    // Edges: 0=top, 1=right, 2=bottom, 3=left
    if (y === y1 && x >= x1 && x <= x2) return { edge: 0, t: (x - x1) }; // top
    if (x === x2 && y >= y1 && y <= y2) return { edge: 1, t: (y - y1) }; // right
    if (y === y2 && x <= x2 && x >= x1) return { edge: 2, t: (x2 - x) }; // bottom
    if (x === x1 && y <= y2 && y >= y1) return { edge: 3, t: (y2 - y) }; // left
    throw new Error('Start point is not on the rectangle edge');
  }

  // Get edge lengths in order: top, right, bottom, left
  const edgeLens = [
    rect.x2 - rect.x1, // top
    rect.y2 - rect.y1, // right
    rect.x2 - rect.x1, // bottom
    rect.y2 - rect.y1  // left
  ];
  const perimeter = 2 * (rect.x2 - rect.x1 + rect.y2 - rect.y1);

  // Find where we start
  const { edge: startEdge, t: startOffset } = findEdgeAndPosition(start);

  // Helper to walk along the rectangle's perimeter
  function walkPath(direction) {
    // direction: +1 for clockwise, -1 for counterclockwise
    let path = [start];
    let dist = 0;
    let edge = startEdge;
    let offset = startOffset;
    let remaining = perimeter / 2;

    while (remaining > 0) {
      let edgeLen = edgeLens[edge];
      let advance = direction === 1 ? edgeLen - offset : offset;
      if (advance >= remaining) {
        // Final segment lands within this edge
        let ratio = remaining / edgeLen;
        let x, y;
        if (edge === 0) { // top
          x = direction === 1 ? rect.x1 + offset + remaining : rect.x1 + offset - remaining;
          y = rect.y1;
        } else if (edge === 1) { // right
          x = rect.x2;
          y = direction === 1 ? rect.y1 + offset + remaining : rect.y1 + offset - remaining;
        } else if (edge === 2) { // bottom
          x = direction === 1 ? rect.x2 - offset - remaining : rect.x2 - offset + remaining;
          y = rect.y2;
        } else { // left
          x = rect.x1;
          y = direction === 1 ? rect.y2 - offset - remaining : rect.y2 - offset + remaining;
        }
        path.push(new Point2D(x, y));
        break;
      } else {
        // Go to the next corner
        let nextCornerIdx = (edge + direction + 4) % 4;
        path.push(corners[nextCornerIdx]);
        remaining -= advance;
        edge = nextCornerIdx;
        offset = 0;
      }
    }
    return path;
  }

  // Build both paths
  const pathCW = walkPath(1);   // Clockwise
  const pathCCW = walkPath(-1); // Counterclockwise

  // Return as Path2D objects
  return [
    new Path2D(pathCW),
    new Path2D(pathCCW)
  ];
}
