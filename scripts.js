// important constants
const containers = {
  main: {
    width: 1,
    height: 1,
    c_x: 1,
    c_y: 1,
    radius: 1,
    dotRadius: 8,
    numOfPoints: 20,
    multiplier: 2,
    color: "black",
    id: "draw-shapes",
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
    dotRadius: 8,
    numOfPoints: 12,
    multiplier: 2,
    color: "black",
    id: "sample",
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

function resize(container, id, max = 450) {
  container.width = Math.min(max, window.innerWidth - 48);
  container.height = Math.min(window.innerHeight - 48, container.width);
  container.c_x = container.width / 2;
  container.c_y = container.height / 2;
  container.radius = (Math.min(container.width, container.height) - 32) / 2;
  container.lines = [];
  container.points = [];
  draw(container, id);
}

function getSpace(container, id) {
  if (!container.space) {
    const params = { width: container.width, height: container.height };
    container.space = new Two(params).appendTo(document.getElementById(id));
  } else {
    container.space.renderer.setSize(container.width, container.height);
    container.space.clear();
  }
  return container.space;
}

function draw(container, id) {
  getSpace(container, id);

  // two has convenience methods to create shapes.
  var circle = container.space.makeCircle(
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

// Primary logic

resize(containers.main, "draw-shapes");
resize(containers.sample, "sample", 300);

window.addEventListener("resize", () => {
  resize(containers.main, "draw-shapes");
  resize(containers.sample, "sample", 300);
});

function handleNumLines() {
  const value = Number(linesSlider.value);
  document.getElementById(
    "num-lines-label"
  ).textContent = `Number of lines: ${value}`;
  containers.main.numOfLines = value;
  resize(containers.main, "draw-shapes");
}

function handleNumPoints() {
  const value = Number(pointsSlider.value);
  document.getElementById(
    "num-points-label"
  ).textContent = `Number of points: ${value}`;
  containers.main.numOfPoints = value;
  linesSlider.max = containers.main.numOfPoints;
  linesSlider.value = linesSlider.max;
  handleNumLines();
}

function handleMultiplier() {
  const value = Number(multiplierSlider.value);
  document.getElementById(
    "multiplier-label"
  ).textContent = `Multiplier: ${value}`;
  containers.main.multiplier = value;
  resize(containers.main, "draw-shapes");
}

// Sliders
const pointsSlider = document.getElementById("num-points");
pointsSlider.oninput = function () {
  handleNumPoints();
};

const linesSlider = document.getElementById("num-lines");
linesSlider.oninput = function () {
  handleNumLines();
};

const multiplierSlider = document.getElementById("multiplier");
multiplierSlider.oninput = function () {
  handleMultiplier();
};

function handleColor() {
  containers.main.color = document.getElementById("colors").value;
  resize(containers.main, "draw-shapes");
}

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
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
