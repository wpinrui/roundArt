// important constants
const MAX_DOT_RADIUS = 8;

const containers = {
  main: {
    width: 1,
    height: 1,
    c_x: 1,
    c_y: 1,
    radius: 1,
    dotRadius: MAX_DOT_RADIUS,
    numOfPoints: 20,
    multiplier: 2,
    color: "black",
    id: "draw-shapes",
    maxSize: 450,
    space: undefined,
    numOfLines: 20,
    lines: [],
    points: [],
  },
  sample: {
    width: 300,
    height: 300,
    c_x: 150,
    c_y: 150,
    radius: 125,
    dotRadius: MAX_DOT_RADIUS,
    numOfPoints: 12,
    multiplier: 2,
    color: "black",
    id: "sample",
    maxSize: 300,
    space: undefined,
    numOfLines: 12,
    lines: [],
    points: [],
  },
};

// Helper functions
function indexToRadians(container, index) {
  return (index / container.numOfPoints) * 2 * Math.PI;
}

function circlePointCoords(container, index) {
  return {
    x:
      container.c_x +
      container.radius * Math.sin(indexToRadians(container, index)),
    y:
      container.c_y +
      container.radius * Math.cos(indexToRadians(container, index)),
  };
}

function drawDot(container, index, color = "black") {
  if (container.points.length < container.numOfPoints) {
    const coords = circlePointCoords(container, index);
    const dot = container.space.makeCircle(
      coords.x,
      coords.y,
      container.dotRadius
    );
    dot.fill = color;
    dot.stroke = color;
    container.points.push(dot);
  }
}

function drawLine(container, index, color = "black") {
  if (container.lines.length < container.numOfLines) {
    // starting coord
    const start = circlePointCoords(container, index);
    const end = circlePointCoords(
      container,
      (((index + 1) * container.multiplier) % container.numOfPoints) - 1
    );
    const line = container.space.makeLine(start.x, start.y, end.x, end.y);
    line.stroke = color;
    line.linewidth = 2;
    container.lines.push(line);
  }
}

function resize(container) {
  container.width = Math.max(
    0,
    Math.min(container.maxSize, window.innerWidth - 48)
  );
  container.height = Math.max(
    0,
    Math.min(window.innerHeight - 48, container.width)
  );
  container.c_x = container.width / 2;
  container.c_y = container.height / 2;
  container.radius = Math.max(
    0,
    (Math.min(container.width, container.height) - 32) / 2
  );
  // Shrink dots when there are many points so neighbours don't overlap
  const spacing = (2 * Math.PI * container.radius) / container.numOfPoints;
  container.dotRadius = Math.min(MAX_DOT_RADIUS, spacing * 0.3);
  container.lines = [];
  container.points = [];
  draw(container);
}

// Reuse one Two instance per container. Two.js keeps every instance in the
// global Two.Instances array, so creating a new one per redraw leaks.
function getSpace(container) {
  if (!container.space) {
    const params = { width: container.width, height: container.height };
    container.space = new Two(params).appendTo(
      document.getElementById(container.id)
    );
  } else {
    container.space.renderer.setSize(container.width, container.height);
    container.space.clear();
  }
  return container.space;
}

function draw(container) {
  getSpace(container);

  // two has convenience methods to create shapes.
  const circle = container.space.makeCircle(
    container.c_x,
    container.c_y,
    container.radius
  );
  circle.stroke = container.color; // Accepts all valid css color
  circle.linewidth = 5;
  for (let i = 0; i < container.numOfPoints; i++) {
    drawLine(container, i, container.color);
    drawDot(container, i);
  }
  container.space.update();
}

// About dropdown
const aboutButton = document.querySelector(".collapsible");
const aboutContent = aboutButton.nextElementSibling;

function fitAboutContent() {
  if (aboutButton.classList.contains("active")) {
    aboutContent.style.maxHeight = aboutContent.scrollHeight + "px";
  }
}

aboutButton.addEventListener("click", () => {
  aboutButton.classList.toggle("active");
  if (aboutButton.classList.contains("active")) {
    fitAboutContent();
  } else {
    aboutContent.style.maxHeight = null;
  }
});

// Primary logic

resize(containers.main);
resize(containers.sample);

// Coalesce bursts of resize events into one redraw per frame
let resizeFrame = null;
window.addEventListener("resize", () => {
  if (resizeFrame !== null) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    resize(containers.main);
    resize(containers.sample);
    fitAboutContent();
  });
});

// Sliders
const pointsSlider = document.getElementById("num-points");
const linesSlider = document.getElementById("num-lines");
const multiplierSlider = document.getElementById("multiplier");

function handleNumLines() {
  const value = Number(linesSlider.value);
  document.getElementById(
    "num-lines-label"
  ).textContent = `Number of lines: ${value}`;
  containers.main.numOfLines = value;
  resize(containers.main);
}

function handleNumPoints() {
  const value = Number(pointsSlider.value);
  document.getElementById(
    "num-points-label"
  ).textContent = `Number of points: ${value}`;
  containers.main.numOfPoints = value;
  // Keep the user's line count unless it was at the max, in which case
  // follow the new max. The browser clamps the value if the max shrinks.
  const linesAtMax = linesSlider.value === linesSlider.max;
  linesSlider.max = value;
  if (linesAtMax) {
    linesSlider.value = value;
  }
  handleNumLines();
}

function handleMultiplier() {
  const value = Number(multiplierSlider.value);
  document.getElementById(
    "multiplier-label"
  ).textContent = `Multiplier: ${value}`;
  containers.main.multiplier = value;
  resize(containers.main);
}

function handleColor() {
  containers.main.color = document.getElementById("colors").value;
  resize(containers.main);
}

pointsSlider.addEventListener("input", handleNumPoints);
linesSlider.addEventListener("input", handleNumLines);
multiplierSlider.addEventListener("input", handleMultiplier);
document.getElementById("colors").addEventListener("change", handleColor);

// Download Button
function downloadSVG() {
  const svgElem = document.querySelector("#draw-shapes svg");
  svgElem.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const blob = new Blob([svgElem.outerHTML], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.download = "RoundArt.svg";
  element.href = url;
  element.click();
  // Object URLs pin the blob in memory until revoked
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

document.getElementById("download").addEventListener("click", downloadSVG);
