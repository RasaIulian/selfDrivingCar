// Linearly interpolates between A and B based on t (a value between 0 and 1).
function lerp(A, B, t) {
  return A + (B - A) * t;
}

// Determines the intersection point of two line segments, AB and CD.
// If they intersect, it returns the intersection point (x, y) and the relative offset along line AB.
// Returns null if the lines do not intersect.
function getIntersection(A, B, C, D) {
  // Calculating parts of the numerator for t and u.
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);

  // Denominator for t and u calculations (denoted as 'bottom').
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  // Check if the lines are parallel (no intersection).
  if (bottom !== 0) {
    // Calculate the t and u values that define the intersection point along AB and CD.
    const t = tTop / bottom;
    const u = uTop / bottom;

    // Check if the intersection point is within both line segments (t and u are between 0 and 1).
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        // Calculate the intersection point using t.
        x: A.x + t * (B.x - A.x),
        y: A.y + t * (B.y - A.y),
        offset: t, // The relative distance from point A to the intersection along AB.
      };
    }
  }

  return null; // Return null if there's no intersection.
}

// Checks whether two polygons (poly1 and poly2) intersect.
// Iterates through all edges of poly1 and poly2, and checks for intersections.
function polysIntersect(poly1, poly2) {
  // Loop over all edges of poly1.
  for (let i = 0; i < poly1.length; i++) {
    // Loop over all edges of poly2.
    for (let j = 0; j < poly2.length; j++) {
      // Check if the current edge of poly1 intersects with the current edge of poly2.
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      );
      if (touch) {
        return true; // Return true if any intersection is found.
      }
    }
  }
  return false; // Return false if no intersections are found.
}

// Generates an RGBA color string based on the given value.
// The value affects the transparency (alpha) and color. Positive values result in yellow, negative values result in red.
function getRGBA(value) {
  const alpha = Math.abs(value); // Alpha (transparency) is determined by the absolute value of 'value'.
  // Red component is full (255) for negative values and decreases with positive values.
  const R = value > 0 ? 255 : 255 * Math.abs(value);
  // Green component is full (255) for positive values (making yellow), and 0 for negative values.
  const G = value > 0 ? 255 : 0;
  const B = 0; // Blue component is always 0 (no blue in this color model).

  // Return the computed RGBA color string.
  return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}