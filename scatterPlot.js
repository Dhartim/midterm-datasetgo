let drawScatterPlot = function(data){
  //console.log(data);
  let countMax = d3.max(data.map(a => a.stationArea));
  let zipcode = data.map(a => a.zipcode);
  let priority = data.map(a => a.priority);
  let callType = data.map(a => a.callType);
  //console.log(callType);
//  console.log(priority);
  //console.log(zipcode);
  //create svg element
  let svg = d3.select("body").select(".scatterplot");
  //plots for svg
  let margin = {
    top:50,
    right: 20,
    bottom: 30,
    left: 60
  };

  //plots for svg
  let bounds = svg.node().getBoundingClientRect();
  //  console.log(bounds.width + " , " + bounds.height);
  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top - margin.bottom;
  //scales
  let zipcodeX = d3.scaleBand()
          .domain(zipcode.sort())//Neighborhooods
          .range([0, plotWidth - 2* margin.left])
          .paddingInner(0.1);
  let stationAreaY = d3.scaleLinear()
          .domain([0, countMax])
          .range([plotHeight,0])
          .nice();
  // let radius = d3.scaleSqrt()
  //               .domain(priority)
  //               .range([2,5])
  //               .nice();
  //console.log(radius);
  let plot = svg.append("g").attr("id", "plot");
  plot.attr("transform", translate(2*margin.left, margin.top - margin.right));
  //draw axis
  let xAxis = d3.axisBottom(zipcodeX);
  let yAxis = d3.axisLeft(stationAreaY);
  yAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));

  let xGroup = plot.append("g").attr("id", "x-axis");
  xGroup.call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", function(d) {
      return "rotate(-65)"
  });
   // we need to translate/shift it down to the bottom
   xGroup.attr("transform", translate(0,plotHeight));
   // do the same for our y axix
   let yGroup = plot.append("g").attr("id", "y-axis");
   yGroup.call(yAxis);

   let color = d3.scaleOrdinal()
                 .range(d3.schemeCategory10);

  const allcircles = svg.append("g").attr("id", "all-circles");
   //create buubbles
   allcircles.selectAll('.bubble')
   .data(data)
   .enter().append('circle')
   .attr('class', 'bubble')
   .attr('cx', function(d){return zipcodeX(d.zipcode);})
   .attr('cy', function(d){ return stationAreaY(d.stationArea); })
   .attr('r', d => d.priority*3)
   .attr("transform", translate(2*margin.left + margin.right, margin.top - margin.right))
   .style('fill', d => color(d.callType));

   //interactivity in chart
   let cells = d3.select(".scatterplot").select("g#all-circles").selectAll("circle");

   //show Tooltip
   cells.on("mouseover.hover", function(data){
     d3.select(this)
     .raise()
     .style("stroke", "red")
     .style("stroke-width", 1);

     let div = d3.select("body").append("div");

      div.attr("id", "details");
      div.attr("class", "tooltip");

      let rows = div.append("table")
        .selectAll("tr")
        .data(Object.keys(data))
        .enter()
        .append("tr");

      rows.append("th").text(key => key)
          .style("color", "black");
      rows.append("td").text(key => "\xa0" + data[key]);
   });

   cells.on("mousemove.hover", function(d) {
    let div = d3.select("div#details");
    // get height of tooltip
    let bbox = div.node().getBoundingClientRect();
    div.style("left", d3.event.clientX + "px")
    div.style("top", d3.event.clientY + (7*bbox.height) + "px");
  });

   cells.on("mouseout.hover", function(d) {
      d3.select(this).style("stroke", null);
      d3.selectAll("div#details").remove();
    });

    cells.on("mouseover.brush1", function(d) {
        cells.filter(e => (d.callType !== e.callType)).transition().style("fill", "#bbbbbb");
      });

    cells.on("mouseout.brush1", function(d) {
        cells.transition().style("fill", d => color(d.callType));
    });

   //label for x-axis
   svg.append("text")
      .attr("class", "x-axis-label")
      .attr("dx","1em")
      .attr("transform",translate(plotWidth/2,(plotHeight + margin.left + 15)))
      .style("text-anchor", "middle")
      .text("Zipcode");
      //label for y-axis
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 + margin.right + 20)
        .attr("x",0 - (plotHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Station Areas  ");
};


function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
