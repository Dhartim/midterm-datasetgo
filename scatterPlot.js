let drawScatterPlot = function(data){
  console.log(data);
  let countMax = d3.max(data.map(a => a.stationArea));
  let zipcode = data.map(a => a.zipcode);
  let priority = data.map(a => a.priority);
  let callType = data.map(a => a.callType);
  //console.log(callType);
  console.log(priority);
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
    let color = d3.scaleOrdinal()
                  .range(d3.schemeCategory10)
      // .domain([callType])
      // .range(["red", "blue", "green", "yellow"])
    //console.log(data.map(a => a.callType));
    //create buubbles
    let bubble = svg.selectAll('.bubble')
    .data(data)
    .enter().append('circle')
    .attr('class', 'bubble')
    .attr('cx', function(d){return zipcodeX(d.zipcode);})
    .attr('cy', function(d){ return stationAreaY(d.stationArea); })
    .attr('r', d => d.priority*3)
    .attr("transform", translate(2*margin.left + margin.right, margin.top - margin.right))
    .style('fill', d => color(d.callType));//function(d){ return color(callType); });


};


function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
