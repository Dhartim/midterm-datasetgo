/* global d3, crossfilter, timeSeriesChart, barChart */

d3.csv("data/timebar.csv", convert).then(function draw(data) {
  let update = timeBarChart(data);
  // print([new Date("Fri Jan 02 2015 00:00:00 GMT-0800 (Pacific Standard Time)"), new Date("Tue Feb 25 2020 00:00:00 GMT-0800 (Pacific Standard Time)")]);
  timeAreaChart(data, update);
});

var dateFmt = d3.timeParse("%Y-%m-%d");

function convert(input) {
  input['Call Date'] = dateFmt(input['Call Date ']);
  delete input['Call Date ']
  for (col of ['Received to Entry', 'Entry to Dispatch', 'Dispatch to Response', 'Response to On Scene']) {
    input[col + ' sum'] = +input[col + ' sum'];
    input[col + ' count'] = +input[col + ' count'];
  }
  input['Zipcode of Incident'] = +input['Zipcode of Incident '];
  delete input['Zipcode of Incident '];
  return input;
}

// // 2015-05-01
// var dateFmt = d3.timeParse("%Y-%m-%d");
//
// var chartTimeline = timeSeriesChart()
//   .width(1000)
//   .x(function (d) { return d.key;})
//   .y(function (d) { return d.value;});
// var barChartGate = barChart()
//   .width(600)
//   .x(function (d) { return d.key;})
//   .y(function (d) { return d.value;});
// var barChartCar = barChart()
//   .x(function (d) { return d.key;})
//   .y(function (d) { return d.value;});
//
// d3.csv("data/Lekagul_slice.csv",
//   function (d) {
//     // This function is applied to each row of the dataset
//     d.Timestamp = dateFmt(d.Timestamp);
//     return d;
//   },
//   function (err, data) {
//     if (err) throw err;
//
//     var csData = crossfilter(data);
//
//     // We create dimensions for each attribute we want to filter by
//     csData.dimTime = csData.dimension(function (d) { return d.Timestamp; });
//     csData.dimCarType = csData.dimension(function (d) { return d["car-type"]; });
//     csData.dimGateName = csData.dimension(function (d) { return d["gate-name"]; });
//
//     // We bin each dimension
//     csData.timesByHour = csData.dimTime.group(d3.timeHour);
//     csData.carTypes = csData.dimCarType.group();
//     csData.gateNames = csData.dimGateName.group();
//
//
//     chartTimeline.onBrushed(function (selected) {
//       csData.dimTime.filter(selected);
//       update();
//     });
//
//     barChartCar.onMouseOver(function (d) {
//       csData.dimCarType.filter(d.key);
//       update();
//     }).onMouseOut(function () {
//       // Clear the filter
//       csData.dimCarType.filterAll();
//       update();
//     });
//
//     barChartGate.onMouseOver(function (d) {
//       csData.dimGateName.filter(d.key);
//       update();
//     }).onMouseOut(function () {
//       // Clear the filter
//       csData.dimGateName.filterAll();
//       update();
//     });
//
//     function update() {
//       d3.select("#timeline")
//         .datum(csData.timesByHour.all())
//         .call(chartTimeline);
//
//       d3.select("#carTypes")
//         .datum(csData.carTypes.all())
//         .call(barChartCar);
//
//       d3.select("#gates")
//         .datum(csData.gateNames.all())
//         .call(barChartGate)
//         .select(".x.axis") //Adjusting the tick labels after drawn
//         .selectAll(".tick text")
//         .attr("transform", "translate(-8,-1) rotate(-45)");
//
//     }
//
//     update();
//
//
//   }
// );
