function drawBarchart(data) {

  let margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 200
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  let f = d3.format(".0f");

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

  //  const g = svg.append("g").attr("id", "rect");
  var bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")

  //append rects
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
      return myColor(d.alarms)
    });





  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }
}
