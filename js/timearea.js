function timeAreaChart(data, update) {
  // setup svg
  const svg = d3.select('body').select('svg#timearea');

  // get current hard-coded size of svg
  const size = {
    width: parseInt(svg.attr('width')),
    height: parseInt(svg.attr('height'))
  };

  // set padding
  const pad = {top: 15, right: 15, bottom: 25, left: 50};

  // setup plot area
  const plot = svg.select('g#areaplot');

  // setup plot width and height
  const width = size.width - pad.left - pad.right;
  const height = size.height - pad.top - pad.bottom;

  const x = d3.scaleTime()
    .range([pad.left, size.width - pad.right])

  const y = d3.scaleLinear()
    .range([height + pad.top, pad.top])
    .nice();

  var formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  function draw(data) {
    let series = dataWrangling(data);
    console.log(series);
    console.log(d3.extent(series, d => new Date(d.key)));
    x.domain(d3.extent(series, d => new Date(d.key)));
    y.domain([0, d3.max(series, d => d.value)]);

    xAxis = g => g
      .attr("transform", `translate(0,${size.height - pad.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 30).tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))

    yAxis = g => g
      .attr("transform", `translate(${pad.left},0)`)
      .call(d3.axisLeft(y).ticks(width / 350, "s").tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))

    svg.select('g#areax')
      .call(xAxis);

    svg.select('g#areay')
      .call(yAxis);

    let area = d3.area().curve(d3.curveLinear)
      .x(d => x(new Date(d.key)))
      .y0(y(0))
      .y1(d => y(d.value));

    plot.select("g#area").append("path")
      .datum(series)
      .attr("fill", "#fecc5c")
      .attr("d", area);

    let brush = d3.brushX()
      .extent([[pad.left, pad.top], [size.width - pad.right, size.height - pad.bottom]])
      .on("end", brushend);

    plot.append("g")
      .attr("id", "brush")
      .call(brush);

    function brushend() {
      let selection = d3.event.selection;
      if (selection == null) {
        update(null, true);
      }
      if (!d3.event.sourceEvent || !selection) return;

      update(selection.map(d => x.invert(d)), true);
    }

    // // since our g elements are already in the proper order, we can draw our svg
    // // elements in any order we want
    // drawLines(data);
    // drawAxis(data);
    // drawLegend(data);
  }

  function dataWrangling(data) {
    let data2 = d3.nest()
      .key(d => d['Call Date'])
      .rollup(function(v) {
        let total = 0;
        let count = 0;
        for (col of ['Received to Entry', 'Entry to Dispatch', 'Dispatch to Response', 'Response to On Scene']) {
          total += d3.sum(v, d => d[col + ' sum']);
          count += d3.sum(v, d => d[col + ' count']);
        }
        return total / count;
      })
      .entries(data);
    console.log(data2);
    return data2;
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

  draw(data);
}
