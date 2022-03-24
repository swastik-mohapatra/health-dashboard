// graph 1 begins
var label = document.querySelector(".label");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cw = (c.width = 380);
var ch = (c.height = 300);
var cx = cw / 2,
  cy = ch / 2;
var rad = Math.PI / 180;
var frames = 0;

ctx.lineWidth = 1;
ctx.strokeStyle = "#999";
ctx.fillStyle = "#ccc";
ctx.font = "14px monospace";

var grd = ctx.createLinearGradient(0, 0, 0, cy);
grd.addColorStop(0, "hsla(240,100%,25%,0.7)");
grd.addColorStop(1, "hsla(240,100%,25%,0)");

var oData = {
  2008: 10,
  2009: 39.9,
  2010: 17,
  2011: 30.0,
  2012: 5.3,
  2013: 38.4,
  2014: 15.7,
  2015: 9.0,
};

var valuesRy = [];
var propsRy = [];
for (var prop in oData) {
  valuesRy.push(oData[prop]);
  propsRy.push(prop);
}

var vData = 4;
var hData = valuesRy.length;
var offset = 50.5; //offset chart axis
var chartHeight = ch - 2 * offset;
var chartWidth = cw - 2 * offset;
var t = 1 / 7; // curvature : 0 = no curvature
var speed = 2; // for the animation

var A = {
  x: offset,
  y: offset,
};
var B = {
  x: offset,
  y: offset + chartHeight,
};
var C = {
  x: offset + chartWidth,
  y: offset + chartHeight,
};

/*
      A  ^
	    |  |  
	    + 25
	    |
	    |
	    |
	    + 25  
      |__|_________________________________  C
      B
*/

// CHART AXIS -------------------------
ctx.beginPath();
ctx.moveTo(A.x, A.y);
ctx.lineTo(B.x, B.y);
ctx.lineTo(C.x, C.y);
ctx.stroke();

// vertical ( A - B )
var aStep = (chartHeight - 50) / vData;

var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
var aStepValue = (Max - Min) / vData;
console.log("aStepValue: " + aStepValue); //8 units
var verticalUnit = aStep / aStepValue;

var a = [];
ctx.textAlign = "right";
ctx.textBaseline = "middle";
for (var i = 0; i <= vData; i++) {
  if (i == 0) {
    a[i] = {
      x: A.x,
      y: A.y + 25,
      val: Max,
    };
  } else {
    a[i] = {};
    a[i].x = a[i - 1].x;
    a[i].y = a[i - 1].y + aStep;
    a[i].val = a[i - 1].val - aStepValue;
  }
  drawCoords(a[i], 3, 0);
}

//horizontal ( B - C )
var b = [];
ctx.textAlign = "center";
ctx.textBaseline = "hanging";
var bStep = chartWidth / (hData + 1);

for (var i = 0; i < hData; i++) {
  if (i == 0) {
    b[i] = {
      x: B.x + bStep,
      y: B.y,
      val: propsRy[0],
    };
  } else {
    b[i] = {};
    b[i].x = b[i - 1].x + bStep;
    b[i].y = b[i - 1].y;
    b[i].val = propsRy[i];
  }
  drawCoords(b[i], 0, 3);
}

function drawCoords(o, offX, offY) {
  ctx.beginPath();
  ctx.moveTo(o.x - offX, o.y - offY);
  ctx.lineTo(o.x + offX, o.y + offY);
  ctx.stroke();

  ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
}
//----------------------------------------------------------

// DATA
var oDots = [];
var oFlat = [];
var i = 0;

for (var prop in oData) {
  oDots[i] = {};
  oFlat[i] = {};

  oDots[i].x = b[i].x;
  oFlat[i].x = b[i].x;

  oDots[i].y = b[i].y - oData[prop] * verticalUnit - 25;
  oFlat[i].y = b[i].y - 25;

  oDots[i].val = oData[b[i].val];

  i++;
}

///// Animation Chart ///////////////////////////
//var speed = 3;
function animateChart() {
  requestId = window.requestAnimationFrame(animateChart);
  frames += speed; //console.log(frames)
  ctx.clearRect(60, 0, cw, ch - 60);

  for (var i = 0; i < oFlat.length; i++) {
    if (oFlat[i].y > oDots[i].y) {
      oFlat[i].y -= speed;
    }
  }
  drawCurve(oFlat);
  for (var i = 0; i < oFlat.length; i++) {
    ctx.fillText(oDots[i].val, oFlat[i].x, oFlat[i].y - 25);
    ctx.beginPath();
    ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  if (frames >= Max * verticalUnit) {
    window.cancelAnimationFrame(requestId);
  }
}
requestId = window.requestAnimationFrame(animateChart);

/////// EVENTS //////////////////////
c.addEventListener(
  "mousemove",
  function (e) {
    label.innerHTML = "";
    label.style.display = "none";
    this.style.cursor = "default";

    var m = oMousePos(this, e);
    for (var i = 0; i < oDots.length; i++) {
      output(m, i);
    }
  },
  false
);

function output(m, i) {
  ctx.beginPath();
  ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
  if (ctx.isPointInPath(m.x, m.y)) {
    //console.log(i);
    label.style.display = "block";
    label.style.top = m.y + 10 + "px";
    label.style.left = m.x + 10 + "px";
    label.innerHTML =
      "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] + "%";
    c.style.cursor = "pointer";
  }
}

// CURVATURE
function controlPoints(p) {
  // given the points array p calculate the control points
  var pc = [];
  for (var i = 1; i < p.length - 1; i++) {
    var dx = p[i - 1].x - p[i + 1].x; // difference x
    var dy = p[i - 1].y - p[i + 1].y; // difference y
    // the first control point
    var x1 = p[i].x - dx * t;
    var y1 = p[i].y - dy * t;
    var o1 = {
      x: x1,
      y: y1,
    };

    // the second control point
    var x2 = p[i].x + dx * t;
    var y2 = p[i].y + dy * t;
    var o2 = {
      x: x2,
      y: y2,
    };

    // building the control points array
    pc[i] = [];
    pc[i].push(o1);
    pc[i].push(o2);
  }
  return pc;
}

function drawCurve(p) {
  var pc = controlPoints(p); // the control points array

  ctx.beginPath();
  //ctx.moveTo(p[0].x, B.y- 25);
  ctx.lineTo(p[0].x, p[0].y);
  // the first & the last curve are quadratic Bezier
  // because I'm using push(), pc[i][1] comes before pc[i][0]
  ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);

  if (p.length > 2) {
    // central curves are cubic Bezier
    for (var i = 1; i < p.length - 2; i++) {
      ctx.bezierCurveTo(
        pc[i][0].x,
        pc[i][0].y,
        pc[i + 1][1].x,
        pc[i + 1][1].y,
        p[i + 1].x,
        p[i + 1].y
      );
    }
    // the first & the last curve are quadratic Bezier
    var n = p.length - 1;
    ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
  }

  //ctx.lineTo(p[p.length-1].x, B.y- 25);
  ctx.stroke();
  ctx.save();
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

function arrayMax(array) {
  return Math.max.apply(Math, array);
}

function arrayMin(array) {
  return Math.min.apply(Math, array);
}

function oMousePos(canvas, evt) {
  var ClientRect = canvas.getBoundingClientRect();
  return {
    //objeto
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top),
  };
}

// graph 1 ends

// pie chart starts

var xValues = ["Total Report", ""];
var yValues = [40,60];
var barColors = ["#b91d47", "#00aba9"];

new Chart("mChart", {
  type: "pie",
  data: {
    labels: xValues,
    datasets: [
      {
        backgroundColor: barColors,
        data: yValues,
      },
    ],
  },
  options: {
    title: {
      display: true,
      text: "",
    },
  },
});

// pie chart ends

// triple ring chart begins
function renderIcons() {
  // Move icon
  if (!this.series[0].icon) {
    this.series[0].icon = this.renderer
      .path(["M", -8, 0, "L", 8, 0, "M", 0, -8, "L", 8, 0, 0, 8])
      .attr({
        stroke: "#303030",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": 2,
        zIndex: 10,
      })
      .add(this.series[2].group);
  }
  this.series[0].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 -
      this.series[0].points[0].shapeArgs.innerR -
      (this.series[0].points[0].shapeArgs.r -
        this.series[0].points[0].shapeArgs.innerR) /
        2
  );

  // Exercise icon
  if (!this.series[1].icon) {
    this.series[1].icon = this.renderer
      .path([
        "M",
        -8,
        0,
        "L",
        8,
        0,
        "M",
        0,
        -8,
        "L",
        8,
        0,
        0,
        8,
        "M",
        8,
        -8,
        "L",
        16,
        0,
        8,
        8,
      ])
      .attr({
        stroke: "#ffffff",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": 2,
        zIndex: 10,
      })
      .add(this.series[2].group);
  }
  this.series[1].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 -
      this.series[1].points[0].shapeArgs.innerR -
      (this.series[1].points[0].shapeArgs.r -
        this.series[1].points[0].shapeArgs.innerR) /
        2
  );

  // Stand icon
  if (!this.series[2].icon) {
    this.series[2].icon = this.renderer
      .path(["M", 0, 8, "L", 0, -8, "M", -8, 0, "L", 0, -8, 8, 0])
      .attr({
        stroke: "#303030",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": 2,
        zIndex: 10,
      })
      .add(this.series[2].group);
  }

  this.series[2].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 -
      this.series[2].points[0].shapeArgs.innerR -
      (this.series[2].points[0].shapeArgs.r -
        this.series[2].points[0].shapeArgs.innerR) /
        2
  );
}

Highcharts.chart("container", {
  chart: {
    type: "solidgauge",
    height: "90%",
    events: {
      render: renderIcons,
    },
  },

  title: {
    text: "This month",
    style: {
      fontSize: "19px",
    },
  },

  tooltip: {
    borderWidth: 0,
    backgroundColor: "none",
    shadow: false,
    style: {
      fontSize: "16px",
    },
    valueSuffix: "%",
    pointFormat:
      '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
    positioner: function (labelWidth) {
      return {
        x: (this.chart.chartWidth - labelWidth) / 2,
        y: this.chart.plotHeight / 2 + 15,
      };
    },
  },

  pane: {
    startAngle: 0,
    endAngle: 360,
    background: [
      {
        // Track for Move
        outerRadius: "102%",
        innerRadius: "88%",
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
          .setOpacity(0.3)
          .get(),
        borderWidth: 0,
      },
      {
        // Track for Exercise
        outerRadius: "87%",
        innerRadius: "63%",
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
          .setOpacity(0.3)
          .get(),
        borderWidth: 0,
      },
      {
        // Track for Stand
        outerRadius: "62%",
        innerRadius: "38%",
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[2])
          .setOpacity(0.3)
          .get(),
        borderWidth: 0,
      },
    ],
  },

  yAxis: {
    min: 0,
    max: 100,
    lineWidth: 0,
    tickPositions: [],
  },

  plotOptions: {
    solidgauge: {
      dataLabels: {
        enabled: false,
      },
      linecap: "round",
      stickyTracking: false,
      rounded: true,
    },
  },

  series: [
    {
      name: "NEW",
      data: [
        {
          color: Highcharts.getOptions().colors[0],
          radius: "112%",
          innerRadius: "88%",
          y: 80,
        },
      ],
    },
    {
      name: "REPORTED",
      data: [
        {
          color: Highcharts.getOptions().colors[1],
          radius: "87%",
          innerRadius: "63%",
          y: 65,
        },
      ],
    },
    {
      name: "RELEASE",
      data: [
        {
          color: Highcharts.getOptions().colors[2],
          radius: "62%",
          innerRadius: "38%",
          y: 50,
        },
      ],
    },
  ],
});

// triple ring chart ends

// bar chart begins

var xValues = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
var yValues = [55, 49, 44, 24, 15, 28, 31];
var barColors = ["red", "green", "blue", "orange", "brown", "purple", "black"];

new Chart("myChart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [
      {
        backgroundColor: barColors,
        data: yValues,
      },
    ],
  },
  options: {
    legend: { display: false },
    title: {
      display: true,
      text: "",
    },
  },
});

// bar chart ends
