function drawBarchart(data) {

  let margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 250
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  let f = d3.format(".2f");

  let svg = d3.select("#barchart-b")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", translate(margin.left, margin.top));

  let myGroups = d3.map(data, function(d) {
    return d.calltype;
  }).keys()
  let myVars = d3.map(data, function(d) {
    return parseFloat(d.minutes);
  }).keys()
  var arr = eval(myVars);

  let x = d3.scaleLinear()
    .range([0, width])
    .domain([0, 11]);
  svg.append("g")
    .attr("transform", translate(0, height))
    .call(d3.axisBottom(x))

  let y = d3.scaleBand()
    .range([height, 0])
    .domain(myGroups)
    .padding(0.01);
  svg.append("g")
    .call(d3.axisLeft(y));
    
  let myColor = d3.scaleLinear()
    .range(["#F4D166", "#E4651E", "#9E3A26"])
    .domain([2000, 50000, 732000]);

  let bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")

  bars.append("rect")
    .attr("class", "bar")
    .attr("y", function(d) {
      return y(d.calltype) + 5;
    })
    .attr("height", y.bandwidth() - 10)
    .attr("x", 1.5)
    .attr("width", function(d) {
      return x(d.minutes);
    })
    .style("fill", function(d) {
      return myColor(d.alarms);
    });

  let annotations = svg.append("g").attr("id", "annotation");

  let newdat = data.forEach(function(d) {
      d.callgroup = d.callgroup;
      d.calltype = d.calltype;
  });
  console.log(newdat);




  //create legend
  let legendColor = d3.scaleLinear()
    .range(["#F4D166", "#9E3A26"])
    .domain([2000, 732000]);

  const defs = svg.append("defs");

  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
    .data(legendColor.ticks().map((t, i, n) => ({
      offset: `${100*i/n.length}%`,
      color: legendColor(t)
    })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  svg
    .append('g')
    .attr("transform", translate(400, margin.top))
    .append("rect")
    .attr('transform', translate(margin.left - 100, 0))
    .attr("width", width - 2 * margin.right - 2 * margin.left + 50)
    .attr("height", 10)
    .style("fill", "url(#linear-gradient)");

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 10)
    .attr("y", margin.top + 25)
    .text("731,722")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 130)
    .attr("y", margin.top + 25)
    .text("2,397")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');


  //interactivity
  bars.on("mouseover", function(d) {
    bars.filter(e => (d.calltype !== e.calltype))
      .transition()
      .attr("fill-opacity", "0.2")

    svg.append('line')
      .attr('id', 'limit')
      .attr('x1', x(d.minutes))
      .attr('y1', 0)
      .attr('x2', x(d.minutes))
      .attr('y2', height)
      .attr('stroke', 'red')

    let me = d3.select(this);
    annotations.insert("text")
      .attr("id", "label")
      .attr("x", x(d.minutes))
      .attr("y", y(d.calltype))
      .attr("text-anchor", "middle")
      .text(f(d.minutes) + " minutes")
      .style('fill', 'white');
  });

  bars.on("mouseout", function(d) {
    bars
      .transition()
      .attr("fill-opacity", "1");
    svg
      .selectAll('#limit').remove()
    annotations
      .select("text#label").remove();
  });


  d3.csv("data/barchart-b.csv").then(getGroupedData);

  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }
}

//function to make tooltip look better
function getGroupedData(row, index) {
  let out = {};
  out.values = []
  out.values.type = ""
  out.values.group = 0

  for (let col in row) {
    switch (col) {
      case 'callgroup':
        out['Minutes:\xa0'] = f(parseFloat(row[col]));
        break;
      case 'calltype':
        out['Call Type:\xa0'] = row[col];
        break;
      case 'neighborhoood':
        out['District:\xa0'] = row[col];
        break;
      case 'alarms':
        out['# Incidents:\xa0'] = row[col];
        break;
      default:
        break;
    }
  }
  return out;
}
