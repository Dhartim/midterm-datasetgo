function timeBarChart(data) {
  // setup svg
  const svg = d3.select('body').select('svg#timebar');

  // get current hard-coded size of svg
  const size = {
    width: parseInt(svg.attr('width')),
    height: parseInt(svg.attr('height'))
  };

  // set padding
  const pad = {top: 15, right: 15, bottom: 25, left: 50};

  // setup plot area
  const plot = svg.select('g#plot');

  // setup plot width and height
  const width = size.width - pad.left - pad.right;
  const height = size.height - pad.top - pad.bottom;

  const x = d3.scaleLinear()
    .range([pad.left, size.width - pad.right])
    .nice()

  const y = d3.scaleBand()
    .range([pad.top, size.height - pad.bottom])
    .padding(0.08)

  const color = d3.scaleOrdinal()
    // .range(d3.schemeTableau10);
    .range(d3.schemeYlOrRd[5].reverse());

  var formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");

  let series;

  function draw(data, animate) {
    console.log(data);
    series = dataWrangling(data);
    console.log(series[0]);
    x.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);
    y.domain(series[0].map(d => d.data.Zipcode));

    color.domain(series.map(d => d.key));

    xAxis = g => g
      .attr("transform", `translate(0,${size.height - pad.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 30, "s").tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))

    yAxis = g => g
      .attr("transform", `translate(${pad.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))

    svg.select('g#x')
      .call(xAxis);

    svg.select('g#y')
      .call(yAxis);

    console.log(series);

    let bars = plot.selectAll("g#bars")
      .data(series)
      .join("g")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", (d, i) => y(d.data.Zipcode))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("class", "bar");

    if (animate) {
        bars.attr("width", 0)
          .attr("x", d => x(0))
            .transition()
            .duration(400)
            .delay(100)
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("x", d => x(d[0]));
    }

    plot.selectAll("rect")
      .on("mouseover", tooltip)
      .on("mousemove", tooltipMove)
      .on("mouseout", tooltipLeave);

    function tooltip(d) {
      let me = d3.select(this);
      let div = d3.select("body").append("div");

      div.attr("id", "details");
      div.attr("class", "tooltip");

      let rows = div.append("table")
        .selectAll("tr")
        .data(["Time: ", "Time: ", "Time: ", "Time: "])
        .enter()
        .append("tr");

      rows.append("th").text(key => key);
      rows.append("td").text(key => d[key]);

      plot.selectAll("rect").filter(e => (d.key !== e.key)).transition().duration(100).style("fill", "#bbbbbb");
    }

    function tooltipMove(d) {
      let div = d3.select("div#details");

      // get height of tooltip
      let bbox = div.node().getBoundingClientRect();

      // https://stackoverflow.com/questions/4666367/how-do-i-position-a-div-relative-to-the-mouse-pointer-using-jquery
      div.style("left", d3.event.pageX + "px")
      div.style("top",  (d3.event.pageY - bbox.height) + "px");
    }

    function tooltipLeave(d) {
      d3.selectAll("div#details").remove();

      plot.selectAll("rect").transition().style("fill", d => color(d.key));
    }

    // Type will be used as color so we will not make an axis for it
    // dimensions = d3.keys(data[0]).filter(d => d != "Type");
    //
    // for (dim in dimensions) {
    //   let name = dimensions[dim];
    //   y[name] = d3.scaleLinear()
    //     .domain(d3.extent(data, d => d[name]))
    //     .range([height, 0]);
    // }
    //
    // x.domain(dimensions);
    //
    // color.domain(data.map(d => d['Type']));
    //
    // // since our g elements are already in the proper order, we can draw our svg
    // // elements in any order we want
    // drawLines(data);
    // drawAxis(data);
    // drawLegend(data);
  }

  function dataWrangling(data) {
    let data2 = d3.nest()
      .key(d => d['Zipcode of Incident'])
      .rollup(function(v) {
        let temp = {};
        temp['Zipcode'] = v[0]['Zipcode of Incident'];
        let total = 0;
        let count = 0;
        for (col of ['Received to Entry', 'Entry to Dispatch', 'Dispatch to Response', 'Response to On Scene']) {
          temp['Avg. ' + col] = d3.sum(v, d => d[col + ' sum']) / d3.sum(v, d => d[col + ' count']);
          total += temp['Avg. ' + col];
          count += d3.sum(v, d => d[col + ' count']);
        }
        temp['Total'] = total;
        temp['Count'] = count;
        return temp;
      })
      .object(data);
    data2 = Object.values(data2);
    data2['columns'] = ['Zipcode'].concat(['Received to Entry', 'Entry to Dispatch', 'Dispatch to Response', 'Response to On Scene'].map(col => 'Avg. ' + col));
    data2 = data2.sort((a, b) => b['Total'] - a['Total'])
    let stack = d3.stack()
      .keys(data2.columns.slice(1))(data2)
      .map(d => (d.forEach(v => v.key = d.key), d));
    return stack;
  }

  /**
   * Draw the axes for the parallel coordinates
   */
  function drawAxis(data) {
    // // Draw the axes
    // svg.select('g#y').selectAll('myAxis')
    //   // For each dimension of the dataset I add a 'g' element:
    //   .data(dimensions).enter()
    //   .append('g')
    //   .attr("class", "axis")
    //   // translate element to its right position on the x axis
    //   .attr('transform', d => `translate(${x(d)})`)
    //   // And I build the axis with the call function
    //   .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    //   // Add axis title
    //   .append('text')
    //     .style('text-anchor', 'middle')
    //     .attr('y', height)
    //     .attr('dy', 15)
    //     .text(d => d)
    //     .style('fill', 'black');
  }

  function drawLegend(data) {
    // let types = [... new Set(data.map(d => d['Type']))];
    // let lConfig = {
    //   'x': 780,
    //   'y': 20,
    //   'width': 175,
    //   'height': 120,
    //   'p': 10,
    //   'marker': {
    //     'width': 15,
    //     'height': 3,
    //     'size': 15
    //   }
    // };
    // // Legend from: https://www.d3-graph-gallery.com/graph/custom_legend.html
    // svg.select("g#legend").append("rect")
    //   .attr("fill", "whitesmoke")
    //   .attr("stroke-width", 1)
    //   .attr("stroke", "gainsboro")
    //   .attr("x", lConfig.x)
    //   .attr("y", lConfig.y)
    //   .attr("rx", 8)
    //   .attr("ry", 8)
    //   .attr("width", lConfig.width)
    //   .attr("height", lConfig.height);
    //
    // svg.select("g#legend").append("text")
    //   .attr("x", lConfig.x + lConfig.width/2)
    //   .attr("y", lConfig.y + 2*lConfig.p)
    //   .attr("text-anchor", "middle")
    //   .text("College Type");
    //
    // svg.select("g#legend").selectAll("mydots")
    //   .data(types)
    //   .enter()
    //   .append("rect")
    //     .attr("class", d => `legend ${kebabCase(d)}-legend`)
    //     .attr("x", lConfig.x + lConfig.p)
    //     .attr("y", (d,i) => lConfig.y + 3.5*lConfig.p + i*(lConfig.marker.size+5)) // 100 is where the first dot appears. 25 is the distance between dots
    //     .attr("width", lConfig.marker.width)
    //     .attr("height", lConfig.marker.height)
    //     .style("fill", d => color(d))
    //     .style("alignment-baseline", "middle")
    //     .on("mouseover", d => {highlight({Type: d})})
    //     .on("mouseleave", d => {doNotHighlight({Type: d})});

    // Add one dot in the legend for each name.
    // svg.select("g#legend").selectAll("mylabels")
    //   .data(types)
    //   .enter()
    //   .append("text")
    //     .attr("class", d => `legend ${kebabCase(d)}-legend`)
    //     .attr("x", lConfig.x + 2*lConfig.p + lConfig.marker.size*1.2)
    //     .attr("y", (d,i) => lConfig.y + 3*lConfig.p  + i*(lConfig.marker.size+5) + (lConfig.marker.size/2)) // 100 is where the first dot appears. 25 is the distance between dots
    //     .style("fill", d => color(d))
    //     .text(d => d)
    //     .attr("text-anchor", "left")
    //     .style("alignment-baseline", "middle")
    //     .on("mouseover", d => {highlight({Type: d})})
    //     .on("mouseleave", d => {doNotHighlight({Type: d})});
  }

  function updateSelection(selection, animate) {
    if (selection == null || selection.length == 0 || selection[0].getTime() === selection[1].getTime()) {
      var newData = data;
    } else {
      var newData = data.filter(function(d) {
        // console.log(new Date(d["Call Date"]), new Date(selection[0]), new Date(d["Call Date"]), new Date(selection[1]));
        return new Date(d["Call Date"]) >= new Date(selection[0])
          && new Date(d["Call Date"]) <= new Date(selection[1]);
      });
    }
    console.log(newData);
    plot.selectAll("rect.bar").remove();
    draw(newData, animate);
  }

  draw(data, true);

  return updateSelection;
}
