

let drawBarChart = function(data)
{

  let svg = d3.select("body").select(".barchart");

  let countMin = 0; // always include 0 in a bar chart!

  /*
   * before we draw, we should decide what kind of margins we
   * want. this will be the space around the core plot area,
   * where the tick marks and axis labels will be placed
   * https://bl.ocks.org/mbostock/3019563
   */
   let margin = {
     top:50,
     right: 20,
     bottom: 30,
     left: 70
   };

  // now we can calculate how much space we have to plot
  let bounds = svg.node().getBoundingClientRect();
  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top - margin.bottom;
  /*
   * https://github.com/d3/d3-scale#api-reference
   */
   let [alarms, series] = convertRowBar(data);
   console.log(series);

  //let [alarms, series] = convertRowBar(data);
  let amountScale = d3.scaleLinear()
    .domain([countMin, d3.max(alarms.values())])
    .range([plotHeight - margin.bottom, 0 + 30])
    .nice()

  let neighborhoodsScale = d3.scaleBand()
    .domain([...alarms.keys()])
    .range([0, plotWidth - margin.bottom])
    .padding(0.1)

  let plot = svg.append("g").attr("id", "plot");

  // shift the plot area over by our margins to leave room
  // for the x- and y-axis
  plot.attr("transform", translate(margin.left - margin.right + 10 , margin.top - margin.left + 5));

  console.assert(plot.size() == 1);

  // now lets draw our x- and y-axis
  // these require our x (count) and y (airline) scales
  let yAxis = d3.axisLeft(amountScale);
  let xAxis = d3.axisBottom(neighborhoodsScale);

  let xGroup = plot.append("g").attr("id", "x-axis");
  //xGroup.call(xAxis.tickFormat(d3.formatPrefix(".0", 1e6)));
  yAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));
  xGroup.call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", function(d) {
      return "rotate(-55)"
  });

  // notice it is at the top of our svg
  // we need to translate/shift it down to the bottom
  xGroup.attr("transform", translate(0,plotHeight - margin.bottom));

  // do the same for our y axix
  let yGroup = plot.append("g").attr("id", "y-axis");
  yGroup.call(yAxis);

  let color = d3.scaleOrdinal()
    .domain(series.map(d => d.key).reverse())
    // .range(d3.schemeSpectral[series.length])
    .range(d3.schemeTableau10)
    .unknown("#ccc");

  let bars = plot.selectAll("rect")
    .data(series);

  /*
   * okay, this is where things get weird. d3 uses an enter, update,
   * exit pattern for dealing with data. think of it as new data,
   * existing data, and old data. for the first time, everything is new!
   * https://bost.ocks.org/mike/selection/
   * https://bost.ocks.org/mike/join/
   */

  // we use the enter() selection to add new bars for new data
  formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  bars.enter().append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .attr("id", "rect-bars")
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("y", (d, i) => amountScale(d[1]))
      .attr("x", d => neighborhoodsScale(d.data.name))
      .attr("height", d => amountScale(d[0]) - amountScale(d[1]))
      .attr("width", neighborhoodsScale.bandwidth())
    .append("title")
      .text(d => `${'Neighborhooods: ' + d.data.name}\n${'Year: ' + d.key}\n${'Number of Alarms: ' + formatValue(d.data[d.key])}`);

//interactivity
  let cells = d3.select(".barchart").selectAll("rect");
  console.log(cells);
  cells.on("mouseover.brush1", function(d) {
      cells.filter(e => (d.key !== e.key)).transition().style("fill", "#bbbbbb");
    });

  cells.on("mouseout.brush1", function(d) {
      cells.transition().style("fill", d => color(d.key));
  });

  //legends
    svg.append("text")
      .attr("x", plotWidth - margin.right)
      .attr("y", margin.top)
      .text("Years");
        ////new LEGEND
      var clicked = ""
      //
      var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter()
      .append("rect")
      .attr("x", plotWidth - margin.right)
      .attr("y", function(d,i){ return margin.top + 10}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", function(d){ return color(d)})
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .on("click",function(d){
     d3.selectAll("#rect-bars").style("opacity",1)

     if (clicked !== d){
       d3.selectAll("#rect-bars")
         .filter(function(e){
         return e.key !== d;
       })
         .style("opacity",0.1)
       clicked = d
     }
      else{
        clicked = ""
      }
    });

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(series.map(d => d.key))
      .enter()
      .append("text")
        .attr("x", plotWidth - margin.right + 15*1.2)
        .attr("y", function(d,i){ return margin.top +12 + i*(15+5) + (15/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

      //  label for x-axis
     svg.append("text")
          .attr("class", "x-axis-label")
          .attr("dx","1em")
          .attr("transform",translate((plotWidth/2 + margin.right),(plotHeight + margin.left - 15)))
        .style("text-anchor", "middle")
        .text("Neighborhooods");
        //label for y-axis
      svg.append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.right + 20)
          .attr("x",0 - (plotHeight / 2 + margin.top))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Number of Alarms ");

};


function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
