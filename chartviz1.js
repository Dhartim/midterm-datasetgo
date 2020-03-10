let drawBarChart = function(data){
  let [alarms, stackedseries] = convertRow(data);
  console.log(alarms);
  console.log(stackedseries);
  let neighborhooods = data.map(row => row['Neighborhooods - Analysis Boundaries'])
  let countMax = d3.max(alarms.values());

  //create svg element
  let svg = d3.select("body").select(".barchart");
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
  let NeighborhooodYScale = d3.scaleBand()
          .domain([...alarms.keys()])//Neighborhooods
          .range([plotHeight,0])
          .paddingInner(0.1);
  let AlarmsXScale = d3.scaleLinear()
          .domain([0, countMax])
          .range([0, plotWidth -2* margin.left])
          .nice();
  let plot = svg.append("g").attr("id", "plot");
  plot.attr("transform", translate(2*margin.left + margin.bottom,margin.top));
  //draw axis
  let xAxis = d3.axisBottom(AlarmsXScale);
  let yAxis = d3.axisLeft(NeighborhooodYScale);
  xAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));

  let xGroup = plot.append("g").attr("id", "x-axis");
  xGroup.call(xAxis);
   // we need to translate/shift it down to the bottom
   xGroup.attr("transform", translate(0,plotHeight));
   // do the same for our y axix
   let yGroup = plot.append("g").attr("id", "y-axis");
   yGroup.call(yAxis);
   //label for x-axis
   svg.append("text")
        .attr("class", "x-axis-label")
        .attr("dx","1em")
        .attr("transform",translate((plotWidth/2 + margin.right),(plotHeight + margin.left + 15)))
      .style("text-anchor", "middle")
      .text("Number of Alarms");
      //label for y-axis
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.right + 20)
        .attr("x",0 - (plotHeight / 2 + margin.top))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Neighborhooods ");
  // we use the enter() selection to add new bars for new data
    let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  let series = d3.stack()
  .keys(data.columns.slice(3))
  (data)
  .map(d => (d.forEach(v => v.key = d.key), d));

  console.log(series);
  let color = d3.scaleOrdinal()
        .domain(series.map(d => d['Priority']))
        .range(d3.schemeSpectral[series.length])
        .unknown("#ccc");
//console.log(series);
        //draw bars in graph
          // append the rectangles for the bar chart
    svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", d => AlarmsXScale(d[1]))
      .attr("y", (d, i) => NeighborhooodYScale(d.data.name))
      .attr("width", d => plotHeight - AlarmsXScale(d[1]) - AlarmsXScale(d[0]))
      .attr("height", NeighborhooodYScale.bandwidth())
      .attr("transform", translate(150,50));//translate(plotWidth - 2*margin.bottom - margin.left, plotHeight - margin.top));
  };



function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
