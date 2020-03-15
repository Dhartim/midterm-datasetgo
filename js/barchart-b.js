function drawBarchart(data) {

  let margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 300
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


  let myGroup = d3.map(data, function(d) {
    return d.callgroup + ":" + d.calltype;
  }).keys()

  myGroup.sort();
  myGroup.reverse();

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
    .domain(myGroup)
    .padding(0.01);

  const yAxis = d3.axisLeft(y)
    .tickFormat(function(d) {
      let res = d.split(":");
      return res[1];
    });

  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')

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
      return y(d.callgroup + ":" + d.calltype) + 5;
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
    .attr("transform", translate(400, 0))
    .append("rect")
    .attr('transform', translate(margin.left - 200, 0))
    .attr("width", width - 2 * margin.right - 2 * (margin.left-100) + 50)
    .attr("height", 10)
    .style("fill", "url(#linear-gradient)");

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 10)
    .attr("y", 25)
    .text("731,722")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 130)
    .attr("y", 25)
    .text("2,397")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');

  svg
    .append("text")
    .attr("class", "text")
    .attr("x", width - 90)
    .attr("y", -10)
    .text("# of Incidents")
    .attr("alignment-baseline", "middle")
    .style('fill', 'white');


  //interactivity
  bars.on("mouseover", function(d) {
    bars.filter(e => ((d.callgroup + ":" + d.calltype) !== (e.callgroup + ":" + e.calltype)))
      .transition()
      .attr("fill-opacity", "0.2")

    svg.append('line')
      .attr('id', 'limit')
      .attr('x1', x(d.minutes))
      .attr('y1', 0)
      .attr('x2', x(d.minutes))
      .attr('y2', height)

    let me = d3.select(this);
    annotations.insert("text")
      .attr("id", "label")
      .attr("x", x(d.minutes)+45)
      .attr("y", d3.event.clientY-55)
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

  // label to xaxis
  svg.append("text")
    .attr("transform", translate(width - 65, height - 10))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Respose time (minutes)");

  // label Alarm to yaxis
  svg.append("text")
    .attr("transform", translate(20 - margin.left, 130))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Alarm");

  svg.append("line")
    .attr('id', 'divider')
    .attr("transform", "rotate(-90)")
    .attr('x1', 0 - height / 2)
    .attr('y1', -400)
    .attr('x2', 0 - height / 2)
    .attr('y2', width)
    .attr('stroke', 'white')

  // label Fire to yaxis
  svg.append("text")
    .attr("transform", translate(20 - margin.left, 330))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Fire");

  svg.append("line")
    .attr('id', 'divider')
    .attr("transform", "rotate(-90)")
    .attr('x1', 0 - height / 2 - 120)
    .attr('y1', -400)
    .attr('x2', 0 - height / 2 - 120)
    .attr('y2', width)
    .attr('stroke', 'white')

  // label Non Life-threatening to yaxis
  svg.append("text")
    .attr("transform", translate(70 - margin.left, 430))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Non Life-Threatening");

  svg.append("line")
    .attr('id', 'divider')
    .attr("transform", "rotate(-90)")
    .attr('x1', 0 - height / 2 - 210)
    .attr('y1', -400)
    .attr('x2', 0 - height / 2 - 210)
    .attr('y2', width)
    .attr('stroke', 'white')

  // label Potentially Life-Threatening to yaxis
  svg.append("text")
    .attr("transform", translate(90 - margin.left, 515))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Potentially Life-Threatening");

// main lables
svg
  .append("text")
  .attr("class", "mainlabel")
  .attr("transform", translate(55 - margin.left, -15))
  .style("text-anchor", "middle")
  .style('fill', 'white')
  .text("Call Type Group");

  svg
    .append("text")
    .attr("class", "mainlabel")
    .attr("transform", translate(275 - margin.left, -15))
    .style("text-anchor", "middle")
    .style('fill', 'white')
    .text("Call Type");


  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }
}
