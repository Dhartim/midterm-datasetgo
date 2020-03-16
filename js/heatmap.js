function drawHeatmap(data) {

  let margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 200
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  let svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", translate(margin.left, margin.top));

  let myGroups = d3.map(data, function(d) {
    return d.neighborhoood;
  }).keys()
  let myVars = d3.map(data, function(d) {
    return d.calltype;
  }).keys()

  let x = d3.scaleBand()
    .range([0, width - 100])
    .domain(myVars)
    .padding(0.01);
  svg.append("g")
    //  .attr("transform", translate(0, height))
    .call(d3.axisTop(x))

  let y = d3.scaleBand()
    .range([height, 0])
    .domain(myGroups)
    .padding(0.01);
  svg.append("g")
    .call(d3.axisLeft(y));

  let myColor = d3.scaleLinear()
    .range(["#F4D166", "#E4651E", "#9E3A26"])
    .domain([1000, 63000, 125000]);

  const g = svg.append("g").attr("id", "rect");

  g.selectAll()
    .data(data, function(d) {
      return d.neighborhoood + ':' + d.calltype;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.calltype)
    })
    .attr("width", x.bandwidth())
    .attr("y", function(d) {
      return y(d.neighborhoood)
    })
    .attr("height", y.bandwidth())
    .style("fill", function(d) {
      return myColor(d.alarms)
    })

  let cells = d3.select(heatmap).select("g#rect").selectAll("rect");

  cells.on("mouseover.hover", function(d) {
    d3.select(this)
      .raise()
      .style("stroke", "red")
      .style("stroke-width", 2);

    let div = d3.select("body").append("div");

    div.attr("id", "details");
    div.attr("class", "tooltip");

    let dataNew = createTooltip(Object(d));
    let rows = div.append("tablenew")
      .selectAll("tr")
      .data(Object.keys(dataNew))
      .enter()
      .append("tr");

    rows.append("th").text(key => key);
    rows.append("td").text(key => dataNew[key]);
    div.style("display", "inline");
  });

  cells.on("mousemove.hover", function(d) {
    let div = d3.select("div#details");
    let bbox = div.node().getBoundingClientRect();

    div.style("left", d3.event.pageX + "px");
    div.style("top", (d3.event.pageY - bbox.height) + "px");
  });

  cells.on("mouseout.hover", function(d) {
    d3.select(this).style("stroke", null);
    d3.selectAll("div#details").remove();
  });

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
    .attr("transform", translate(450, 10))
    .append("rect")
    .attr('transform', translate(margin.left, 0))
    .attr("width", width - 3 * margin.right - 2 * margin.left - 100)
    .attr("height", 10)
    .style("fill", "url(#linear-gradient)");

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 10)
    .attr("y", margin.top + 5)
    .text("731,722")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 80)
    .attr("y", margin.top + 5)
    .text("2,397")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 60)
    .attr("y", margin.top - 28)
    .text("# of Incidents")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  // helper method to make translating easier
  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }

  //function to make tooltip look better
  function createTooltip(row, index) {

    var f = d3.format(".2f");

    let out = {};
    for (let col in row) {
      switch (col) {
        case 'min':
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
}
