let drawBarChart = function(data)
{
  let svg = d3.select("body").select(".barchart");

  console.assert(svg.size() == 1);

  let [alarms, series] = convertRowBar(data);
  console.log(series);

  let countMin = 0; // always include 0 in a bar chart!
  let countMax = d3.max(alarms.values());

  if (isNaN(countMax)) {
    countMax = 0;
  }

  console.log("count bounds:", [countMin, countMax]);

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

  // Chart title
  // svg.append("g").append("text")
  //       .attr("x", (plotWidth / 2) + margin.left - 60)
  //       .attr("y", margin.top + 10)
  //       .attr("text-anchor", "middle")
  //       .style("font-size", "24px")
  //       .text("Airline Passengers by Region");

  /*
   * https://github.com/d3/d3-scale#api-reference
   */
  let amountScale = d3.scaleLinear()
    .domain([countMin, countMax])
    .range([plotHeight - margin.bottom, 0 + 30])
    .nice()

  let neighborhoodsScale = d3.scaleBand()
    .domain([...alarms.keys()])
    .range([0, plotWidth - margin.bottom])
    .padding(0.01)

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
  // // text label for the x axis
  // plot.append("text")
  //     .attr("transform",
  //           `translate(${(plotWidth/2) - 40} ,${(plotHeight + margin.top + 15)})`)
  //     .style("text-anchor", "middle")
  //     .text("Passenger Count");

  // notice it is at the top of our svg
  // we need to translate/shift it down to the bottom
  xGroup.attr("transform", translate(0,plotHeight - margin.bottom));

  // do the same for our y axix
  let yGroup = plot.append("g").attr("id", "y-axis");
  yGroup.call(yAxis);
  // text label for the y axis
  // plot.append("text")
  //   .attr("x", -70)
  //   .attr("y", 5)
  //   .attr("dy", "1em")
  //   .style("text-anchor", "middle")
  //   .text("Operating Airline");
  // yGroup.attr("transform", "translate(0," + 0 + ")");


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
  let color = d3.scaleOrdinal()
    .domain(series.map(d => d.key).reverse())
    // .range(d3.schemeSpectral[series.length])
    .range(d3.schemeTableau10)
    .unknown("#ccc");

  // console.log(series.map(d => d.key));

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
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("transform", translate(0, 0))
      .attr("y", (d, i) => amountScale(d[1]))
      .attr("x", d => neighborhoodsScale(d.data.name))
      .attr("height", d => amountScale(d[0]) - amountScale(d[1]))
      .attr("width", neighborhoodsScale.bandwidth())
    .append("title")
      .text(d => `${d.data.name} ${d.key}
${formatValue(d.data[d.key])}`);
  // bars.enter().append("g")
  //   .selectAll("g")
  //   .data(series)
  //   .join("g")
  //   // Color by region
  //     .attr("fill", d => color(d.key))
  //   // Draw bars
  //   .selectAll("rect")
  //   .data(d => d)
  //   .join("rect")
  //     .attr("y", d => amountScale(d[0]))
  //     .attr("x", (d, i) => neighborhooodsScale(d.data.name))
  //     .attr("height", d => plotWidth - (amountScale(d[1]) - amountScale(d[0])))
  //     .attr("width", neighborhooodsScale.bandwidth())
  //   // On hover text
  //   .append("title")
  //     .text(d => `${d.data.name} ${d.key}
  // ${formatValue(d.data[d.key])}`);

};



// let drawBarChart = function(data){
//   let [alarms, stackedseries] = convertRowBar(data);
//   console.log(alarms);
//   console.log(stackedseries);
//   let neighborhooods = data.map(row => row['Neighborhooods'])
//   let countMax = d3.max(alarms.values());
//
//   //create svg element
//   let svg = d3.select("body").select(".barchart");
//   //plots for svg
//   let margin = {
//     top:50,
//     right: 20,
//     bottom: 30,
//     left: 60
//   };
//   //plots for svg
//   let bounds = svg.node().getBoundingClientRect();
//   //  console.log(bounds.width + " , " + bounds.height);
//   let plotWidth = bounds.width - margin.right - margin.left;
//   let plotHeight = bounds.height - margin.top - margin.bottom;
//   //scales
//   let NeighborhooodYScale = d3.scaleBand()
//           .domain([...alarms.keys()])//Neighborhooods
//           .range([plotHeight,0])
//           .paddingInner(0.1);
//   let AlarmsXScale = d3.scaleLinear()
//           .domain([0, countMax])
//           .range([0, plotWidth -2* margin.left])
//           .nice();
//   let plot = svg.append("g").attr("id", "plot");
//   plot.attr("transform", translate(2*margin.left + margin.bottom,margin.top));
//   //draw axis
//   let xAxis = d3.axisBottom(AlarmsXScale);
//   let yAxis = d3.axisLeft(NeighborhooodYScale);
//   xAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));
//
//   let xGroup = plot.append("g").attr("id", "x-axis");
//   xGroup.call(xAxis);
//    // we need to translate/shift it down to the bottom
//    xGroup.attr("transform", translate(0,plotHeight));
//    // do the same for our y axix
//    let yGroup = plot.append("g").attr("id", "y-axis");
//    yGroup.call(yAxis);
//    //label for x-axis
//    svg.append("text")
//         .attr("class", "x-axis-label")
//         .attr("dx","1em")
//         .attr("transform",translate((plotWidth/2 + margin.right),(plotHeight + margin.left + 15)))
//       .style("text-anchor", "middle")
//       .text("Number of Alarms");
//       //label for y-axis
//     svg.append("text")
//         .attr("class", "y-axis-label")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - margin.right + 20)
//         .attr("x",0 - (plotHeight / 2 + margin.top))
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .text("Neighborhooods ");
//   // we use the enter() selection to add new bars for new data
//     let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
//     let series = d3.stack()
//       .keys(data.columns.slice(1))
//       (data)
//       .map(d => (d.forEach(v => v.key = d.key), d))
//       console.log(series);
//
//     let color = d3.scaleOrdinal()
//       .domain(series.map(d => d.key).reverse())
//       .range(d3.schemeTableau10)
//       .unknown("#ccc")
// //console.log(series);
//         //draw bars in graph
//           // append the rectangles for the bar chart
//     svg.append("g")
//     .selectAll("g")
//     .data(series)
//     .join("g")
//       .attr("fill", d => color(d.key))
//     .selectAll("rect")
//     .data(d => d)
//     .join("rect")
//       .attr("y", (d, i) => NeighborhooodYScale(d.data.Neighborhooods))
//       .attr("x", d => AlarmsXScale(d[1]))
//       .attr("height", d => console.log(AlarmsXScale(d[0]) - AlarmsXScale(d[1])))
//       .attr("width", NeighborhooodYScale.bandwidth())
//     .append("title")
//       .text(d => `${d.data.Neighborhooods} ${d.key}
// ${formatValue(d.data[d.key])}`);
//     // svg.append("g")
//     // .selectAll("g")
//     // .data(series)
//     // .join("g")
//     // .attr("fill", d => color(d.key))
//     // .selectAll("rect")
//     // .data(d => d)
//     // .join("rect")
//     //   .attr("x", d => AlarmsXScale(d[1]))
//     //   .attr("y", (d, i) => NeighborhooodYScale(d.data.Neighborhooods))
//     //   .attr("width", d => plotHeight - AlarmsXScale(d[2]) - AlarmsXScale(d[1]))
//     //   .attr("height", NeighborhooodYScale.bandwidth())
//     //   .attr("transform", translate(150,50));//translate(plotWidth - 2*margin.bottom - margin.left, plotHeight - margin.top));
//   };



function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
//   console.log(data);
//   // let neighborhooodsList = data.map(d => d.neighborhooods);
//   let keys = data.columns.slice(2);
//   let year   = [...new Set(data.map(d => d.Year))]
// 	let neighborhooods = [...new Set(data.map(d => d.Neighborhooods))]
// //  console.log(keys);
//   //let alarms = data.map( d=> d.numofalarms);
//   //let years = data.map(d => d.callDate);
//   var options = d3.select("#year").selectAll("option")
// 		.data(year)
// 	  .enter().append("option")
// 		.text(d => d)
//
//     var svg = d3.select("body").select(".barchart"),
//   		margin = {top: 35, left: 35, bottom: 0, right: 15},
//   		width = +svg.attr("width") - margin.left - margin.right,
//   		height = +svg.attr("height") - margin.top - margin.bottom;
//
//   	var y = d3.scaleBand()
//   		.range([margin.top, height - margin.bottom])
//   		.padding(0.1)
//   		.paddingOuter(0.2)
//   		.paddingInner(0.2)
//
//   	var x = d3.scaleLinear()
//   		.range([margin.left, width - margin.right])
//
//   	var yAxis = svg.append("g")
//   		.attr("transform", `translate(${margin.left},0)`)
//   		.attr("class", "y-axis")
//
//   	var xAxis = svg.append("g")
//   		.attr("transform", `translate(0,${margin.top})`)
//   		.attr("class", "x-axis")
//  let priority = data.map(d => d.Priority);
  //console.log(neighborhooods);
  //create svg
  // let svg = d3.select("body").select(".barchart");
  // //plots for svg
  // let margin = {
  //   top: 50,
  //   right: 20,
  //   bottom: 30,
  //   left: 60
  // };
  // //plots for svg
  // let bounds = svg.node().getBoundingClientRect();
  // let plotWidth = bounds.width - margin.right - margin.left;
  // let plotHeight = bounds.height - margin.top - margin.bottom;
  // //scales
  // let neighborhooodsYScale = d3.scaleBand()
  //         .domain(neighborhooods)//Neighborhooods
  //         .range([plotHeight, 0])
  //         .paddingInner(0.1);
  // let alarmsXScale = d3.scaleLinear()
  //       .range([0, plotWidth - margin.top-margin.bottom-10])
  //       .nice();
  // let plot = svg.append("g").attr("id", "plot");
  // plot.attr("transform", translate(2*margin.left + margin.bottom , margin.top - margin.bottom));
  // //draw axis
  // let xAxis = d3.axisBottom(alarmsXScale);
  // let yAxis = d3.axisLeft(neighborhooodsYScale);
  // xAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));
  //
  // let xGroup = plot.append("g").attr("id", "x-axis");
  // xGroup.call(xAxis);
  // // we need to translate/shift it down to the bottom
  // xGroup.attr("transform", translate(0,plotHeight));
  // // do the same for our y axix
  // let yGroup = plot.append("g").attr("id", "y-axis");
  // yGroup.call(yAxis);

  //colors
  // let color = d3.scaleOrdinal()
	// 	.range(["steelblue", "darkorange"])
  //   .domain(keys);


  // //label for x-axis
  // svg.append("text")
  //      .attr("class", "x-axis-label")
  //      .attr("dx","1em")
  //      .attr("transform",translate((plotWidth/2 + margin.right),(plotHeight + margin.left + 15)))
  //    .style("text-anchor", "middle")
  //    .text("Number of Alarms");
  //    //label for y-axis
  //  svg.append("text")
  //      .attr("class", "y-axis-label")
  //      .attr("transform", "rotate(-90)")
  //      .attr("y", 0 - margin.right + 20)
  //      .attr("x",0 - (plotHeight / 2 + margin.top))
  //      .attr("dy", "1em")
  //      .style("text-anchor", "middle")
  //      .text("Neighborhooods ");
//year selection
    // update(d3.select("#year").property("value"), 0)
    // var formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
    // function update(input, speed) {
    //
    // var data = data.filter(f => f.Year == input)
    // console.log(data);
    // data.forEach(function(d) {
    //   d.total = d3.sum(keys, k => +d[formatValue(k)])
    //   return d
    // })
    //
    // x.domain([0, d3.max(data, d => d.total)]).nice();
    //
    // svg.selectAll(".x-axis").transition().duration(speed)
    //   .call(d3.axisTop(x).ticks(null, "s"));
    //
    // //y.domain(data.map(d => d.State));
    //
    // svg.selectAll(".y-axis").transition().duration(speed)
    //   .call(d3.axisLeft(y).tickSizeOuter(0))
    //
    // var group = svg.selectAll("g.layer")
    //   .data(d3.stack().keys(keys)(data), d => d.key)
    //
    // group.exit().remove()
    //
    // group.enter().insert("g", ".y-axis").append("g")
    //   .classed("layer", true)
    //   .attr("fill", d => z(d.key));
    //
    // var bars = svg.selectAll("g.layer").selectAll("rect")
    //   .data(d => d, e => e.data.Neighborhooods);
    //
    // bars.exit().remove()
    //
    // bars.enter().append("rect")
    //   .attr("height", y.bandwidth())
    //   .merge(bars)
    // .transition().duration(speed)
    //   .attr("y", d => y(d.data.Neighborhooods))
    //   .attr("x", d => x(d[0]))
    //   .attr("width", d => x(d[1]) - x(d[0]))
    //
    // var text = svg.selectAll(".text")
    //   .data(data, d => d.Neighborhooods);
    //
    // text.exit().remove()
    //
    // text.enter().append("text")
    //   .attr("class", "text")
    //   .attr("text-anchor", "start")
    //   .merge(text)
    // .transition().duration(speed)
    //   .attr("y", d => y(d.Neighborhooods) + y.bandwidth() / 2)
    //   .attr("x", d => x(d.total) + 5)
    //   .text(d => d.total)
    // }
    //
    // var select = d3.select("#year")
    // .on("change", function() {
    //   update(this.value, 750)
    // })
  //bars
// let drawBarChart = function(data){
//   let [alarms, stackedseries] = convertRow(data);
//   console.log(alarms);
//   console.log(stackedseries);
//   let neighborhooods = data.map(row => row['Neighborhooods - Analysis Boundaries'])
//   let countMax = d3.max(alarms.values());
//
//   //create svg element
//   let svg = d3.select("body").select(".barchart");
//   //plots for svg
//   let margin = {
//     top:50,
//     right: 20,
//     bottom: 30,
//     left: 60
//   };
//   //plots for svg
//   let bounds = svg.node().getBoundingClientRect();
//   //  console.log(bounds.width + " , " + bounds.height);
//   let plotWidth = bounds.width - margin.right - margin.left;
//   let plotHeight = bounds.height - margin.top - margin.bottom;
//   //scales
//   let NeighborhooodYScale = d3.scaleBand()
//           .domain([...alarms.keys()])//Neighborhooods
//           .range([plotHeight,0])
//           .paddingInner(0.1);
//   let AlarmsXScale = d3.scaleLinear()
//           .domain([0, countMax])
//           .range([0, plotWidth -2* margin.left])
//           .nice();
//   let plot = svg.append("g").attr("id", "plot");
//   plot.attr("transform", translate(2*margin.left + margin.bottom,margin.top));
//   //draw axis
//   let xAxis = d3.axisBottom(AlarmsXScale);
//   let yAxis = d3.axisLeft(NeighborhooodYScale);
//   xAxis.ticks(10, "f").tickFormat(d3.formatPrefix(".0", 50000));
//
//   let xGroup = plot.append("g").attr("id", "x-axis");
//   xGroup.call(xAxis);
//    // we need to translate/shift it down to the bottom
//    xGroup.attr("transform", translate(0,plotHeight));
//    // do the same for our y axix
//    let yGroup = plot.append("g").attr("id", "y-axis");
//    yGroup.call(yAxis);
//    //label for x-axis
//    svg.append("text")
//         .attr("class", "x-axis-label")
//         .attr("dx","1em")
//         .attr("transform",translate((plotWidth/2 + margin.right),(plotHeight + margin.left + 15)))
//       .style("text-anchor", "middle")
//       .text("Number of Alarms");
//       //label for y-axis
//     svg.append("text")
//         .attr("class", "y-axis-label")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - margin.right + 20)
//         .attr("x",0 - (plotHeight / 2 + margin.top))
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .text("Neighborhooods ");
//   // we use the enter() selection to add new bars for new data
//     let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
//   };
//
//
//
