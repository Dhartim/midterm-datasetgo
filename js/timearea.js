let timeAreaChart = (data, update) => {
  // Set up chart references
  const svg = d3.select('body').select('svg#timearea');
  const plot = svg.select('g#areaplot');

  // Set up chart sizes
  const size = {
    width: parseInt(svg.attr('width')),
    height: parseInt(svg.attr('height'))
  };
  const pad = {top: 15, right: 15, bottom: 30, left: 50};
  const width = size.width - pad.left - pad.right;
  const height = size.height - pad.top - pad.bottom;

  // Set up axes
  const x = d3.scaleTime()
    .range([pad.left, size.width - pad.right])
  const y = d3.scaleLinear()
    .range([height + pad.top, pad.top])
    .nice();

  let draw = data => {
    let series = dataWrangling(data);

    drawAxis(series);
    drawArea(series);
    drawBrush();
    return this;
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

  let drawAxis = series => {
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

    svg.select('g#areax').append("text")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("x", width/2 + pad.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Call Date");

    svg.select('g#areay').append("text")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("x", 0)
      .attr("y", pad.top -5)
      .attr("text-anchor", "middle")
      .text("Average Minutes");
    return [x, y];
  }

  let drawArea = series => {
    let area = d3.area().curve(d3.curveLinear)
      .x(d => x(new Date(d.key)))
      .y0(y(0))
      .y1(d => y(d.value));

    plot.select("g#area").append("path")
      .datum(series)
      .attr("fill", "#fecc5c")
      .attr("d", area);
    return area;
  }

  let drawBrush = () => {

    let brushend = () => {
      let selection = d3.event.selection;
      if (selection == null) {
        update(null, true);
      }
      if (!d3.event.sourceEvent || !selection) return;

      update(selection.map(d => x.invert(d)), true);
      return selection;
    }
    let brush = d3.brushX()
      .extent([[pad.left, pad.top], [size.width - pad.right, size.height - pad.bottom]])
      .on("end", brushend);

    plot.append("g")
      .attr("id", "brush")
      .call(brush);
    return brush;
  }

  draw(data);

  return this;
}
