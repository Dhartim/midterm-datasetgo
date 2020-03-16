let timeBarChart = data => {
  // Chart references
  const svg = d3.select('body').select('svg#timebar');
  const plot = svg.select('g#plot');

  // Sizing
  const size = {
    width: parseInt(svg.attr('width')),
    height: parseInt(svg.attr('height'))
  };
  const pad = {top: 15, right: 15, bottom: 35, left: 50};
  const width = size.width - pad.left - pad.right;
  const height = size.height - pad.top - pad.bottom;

  // Scales
  const x = d3.scaleLinear()
    .range([pad.left, size.width - pad.right])
    .nice()
  const y = d3.scaleBand()
    .range([pad.top, size.height - pad.bottom])
    .padding(0.08)
  const color = d3.scaleOrdinal()
    .range(d3.schemeYlOrRd[5].reverse());

  // Check initial chart animation status
  let animated = true;

  // Mapping for neighborhoods
  const zipToNeighborhood = {
    94123.0: 'Pacific Heights/Marina/Russian Hill/Presidio',
    94110.0: 'Mission/Potrero Hill/Bernal Heights/Castro/Upper Market/Noe Valley/Glen Park',
    94103.0: 'South of Market/Financial District/South Beach/Mission/Castro/Upper Market/Hayes Valley/Tenderloin/Mission Bay/Potrero Hill',
    94124.0: 'Bayview Hunters Point/Bernal Heights/Potrero Hill/Portola/None',
    94108.0: 'Nob Hill/Chinatown/Financial District/South Beach',
    94158.0: 'Mission Bay/Potrero Hill/None',
    94127.0: 'West of Twin Peaks/Twin Peaks/Oceanview/Merced/Ingleside',
    94102.0: 'Tenderloin/Western Addition/South of Market/Hayes Valley/Nob Hill/Financial District/South Beach',
    94132.0: 'Lakeshore/Oceanview/Merced/Ingleside/Sunset/Parkside/West of Twin Peaks',
    94134.0: 'Portola/Visitacion Valley/Excelsior/McLaren Park/Bayview Hunters Point/None',
    94112.0: 'West of Twin Peaks/Excelsior/Outer Mission/Oceanview/Merced/Ingleside/McLaren Park/Bernal Heights',
    94109.0: 'Tenderloin/Nob Hill/Russian Hill/Pacific Heights/Western Addition/Japantown/Marina',
    94117.0: 'Haight Ashbury/Hayes Valley/Lone Mountain/USF/Inner Sunset/Western Addition/Castro/Upper Market/Golden Gate Park',
    94122.0: 'Sunset/Parkside/Inner Sunset/Golden Gate Park/Lone Mountain/USF/Inner Richmond/Outer Richmond',
    'Unknown': 'None/Excelsior/Visitacion Valley',
    94133.0: 'Chinatown/North Beach/Nob Hill/Russian Hill',
    94131.0: 'Noe Valley/Glen Park/Inner Sunset/Twin Peaks/West of Twin Peaks/Castro/Upper Market',
    94111.0: 'Chinatown/Financial District/South Beach/North Beach',
    94118.0: 'Inner Richmond/Outer Richmond/Lone Mountain/USF/Presidio Heights/Golden Gate Park/Seacliff/Presidio',
    94115.0: 'Pacific Heights/Western Addition/Japantown/Presidio Heights/Lone Mountain/USF/Presidio',
    94129.0: 'Presidio/Inner Richmond/Seacliff',
    94104.0: 'Financial District/South Beach/Chinatown',
    94114.0: 'Castro/Upper Market/Noe Valley/Hayes Valley/Twin Peaks/Mission/Inner Sunset/Haight Ashbury',
    94116.0: 'Sunset/Parkside/Inner Sunset/West of Twin Peaks',
    94107.0: 'Potrero Hill/Mission Bay/South of Market/Financial District/South Beach/Bayview Hunters Point/Mission',
    94105.0: 'Financial District/South Beach/South of Market',
    94130.0: 'Treasure Island',
    94121.0: 'Outer Richmond/Seacliff/Golden Gate Park/Lincoln Park'
  };

  let draw = (data, animate) => {
    let formatTime = d3.timeFormat("%B %d, %Y");
    let daterange = d3.extent(data, d => new Date(d['Call Date']));
    d3.select("text#daterange")
      .text(`From ${formatTime(daterange[0])} to ${formatTime(daterange[1])}`);
    let series = dataWrangling(data);

    drawAxis(series);
    drawBars(series, animate);
    drawLegend(series);
    addTooltips();
    return this;
  }

  let dataWrangling = (data) => {
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

  let drawAxis = (series) => {
    // Set axes domains
    x.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);
    y.domain(series[0].map(d => d.data.Zipcode));
    color.domain(series.map(d => d.key));

    // Set up axes
    xAxis = g => g
      .attr("transform", `translate(0,${size.height - pad.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 30, "s").tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))
    yAxis = g => g
      .attr("transform", `translate(${pad.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call(g => g.selectAll(".domain"))

    // Call axes
    svg.select('g#x')
      .call(xAxis);
    svg.select('g#y')
      .call(yAxis);

    svg.select('g#x').append("text")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("x", width/2 + pad.left)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Average Minutes");

    svg.select('g#y').append("text")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("x", 0)
      .attr("y", pad.top -5)
      .attr("text-anchor", "left")
      .text("Zipcode");
    return [x, y];
  }

  let drawBars = (series, animate) => {
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

    animated = true;
    if (animate) {
      animated = false;
      bars.attr("width", 0)
        .attr("x", d => x(0))
          .transition()
          .duration(400)
          .delay(100)
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("x", d => x(d[0]))
        .on("end", function(d) { animated=true; });
    }
    return bars;
  }

  let highlight = (key) => {
    if (!animated) {
      plot.selectAll("rect").filter(e => (key !== e.key))
        .transition().duration(100).delay(400)
        .style("opacity", 0.2);
    } else {
      plot.selectAll("rect").filter(e => (key !== e.key))
        .transition().duration(100)
        .style("opacity", 0.2);
    }
  }

  let unhighlight = () => {
    if (!animated) {
      plot.selectAll("rect")
        .transition().duration(100).delay(400)
        .style("opacity", 1);
    } else {
      plot.selectAll("rect")
        .transition().duration(100)
        .style("opacity", 1);
    }
  }

  let addTooltips = () => {
    let tooltip = d => {
      let me = d3.select(this);
      let div = d3.select("body").append("div");

      div.attr("id", "details");
      div.attr("class", "tooltip");

      let rows = div.append("table")
        .selectAll("tr")
        .data(["Type: ", "Average: ", "Total Average: ", "Total Count: ", "Zipcode: "])
        .enter()
        .append("tr");

      let formatDecimal = d3.format(".2f");

      let tips = {
        "Type: ": d.key,
        "Average: ": formatDecimal(d[1] - d[0]) + " minutes",
        "Total Average: ": formatDecimal(d.data.Total) + " minutes",
        "Total Count: ": d.data.Count + " calls",
        "Zipcode: ": d3.format(".0f")(d.data.Zipcode)
      };

      rows.append("th").text(key => key).style("padding-right", "10px");
      rows.append("td").text(key => tips[key]);

      highlight(d.key);
      return rows;
    }
    let tooltipMove = d => {
      let div = d3.select("div#details");

      // get height of tooltip
      let bbox = div.node().getBoundingClientRect();

      // https://stackoverflow.com/questions/4666367/how-do-i-position-a-div-relative-to-the-mouse-pointer-using-jquery
      div.style("left", d3.event.pageX + "px")
      div.style("top",  (d3.event.pageY - bbox.height) + "px");
      return div;
    }
    let tooltipLeave = d => {
      let me = d3.select(this);
      d3.selectAll("div#details").remove();

      unhighlight();
      return me;
    }
    plot.selectAll("rect")
      .on("mouseover", tooltip)
      .on("mousemove", tooltipMove)
      .on("mouseout", tooltipLeave);

    svg.select('g#y').selectAll(".tick text")
      .on("mouseover", d => {
        let me = d3.select(this);
        let div = d3.select("body").append("div");

        div.attr("id", "details");
        div.attr("class", "tooltip");

        let rows = div.append("table")
          .selectAll("tr")
          .data(["Zipcode: ", "Neighborhoods: "])
          .enter()
          .append("tr");

        let tips = {
          "Zipcode: ": d3.format(".0f")(d),
          "Neighborhoods: ": zipToNeighborhood[d]
        };

        rows.append("th").text(key => key).style("padding-right", "10px");
        rows.append("td").text(key => tips[key]);
      }).on("mousemove", tooltipMove)
      .on("mouseout", tooltipLeave);
  }

  let drawLegend = series => {
    let types = ['Avg. Received to Entry', 'Avg. Entry to Dispatch', 'Avg. Dispatch to Response', 'Avg. Response to On Scene'];
    let lConfig = {
      'x': 700,
      'y': 350,
      'width': 225,
      'height': 100,
      'p': 10,
      'marker': {
        'size': 10
      }
    };

    // Drop shadow for more contrast
    svg.select("g#legend").append("rect")
      .attr("fill", "rgba(190, 199, 189, 0.5)")
      .attr("x", lConfig.x + 2)
      .attr("y", lConfig.y + 2)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("width", lConfig.width)
      .attr("height", lConfig.height);

    // Legend from: https://www.d3-graph-gallery.com/graph/custom_legend.html
    svg.select("g#legend").append("rect")
      .attr("fill", "rgba(30, 30, 30, 1)")
      .attr("stroke", "rgba(90, 90, 90, 1)")
      .attr("x", lConfig.x)
      .attr("y", lConfig.y)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("width", lConfig.width)
      .attr("height", lConfig.height);

    svg.select("g#legend").append("text")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("x", lConfig.x + lConfig.width/2)
      .attr("y", lConfig.y + 2*lConfig.p)
      .attr("text-anchor", "middle")
      .text("Time Stages");

    svg.select("g#legend").selectAll("mydots")
      .data(types)
      .enter()
      .append("rect")
        .attr("x", lConfig.x + lConfig.p)
        .attr("y", (d,i) => lConfig.y + 3*lConfig.p + i*(lConfig.marker.size+5))
        .attr("width", lConfig.marker.size)
        .attr("height", lConfig.marker.size)
        .style("fill", d => color(d))
        .style("alignment-baseline", "middle")
        .on("mouseover", d => highlight(d))
        .on("mouseleave", d => unhighlight({Type: d}));

    // Add one dot in the legend for each name.
    svg.select("g#legend").selectAll("mylabels")
      .data(types)
      .enter()
      .append("text")
        .attr("x", lConfig.x + 2*lConfig.p + lConfig.marker.size*1.2)
        .attr("y", (d,i) => lConfig.y + 3*lConfig.p  + i*(lConfig.marker.size+5) + (lConfig.marker.size/2))
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", d => highlight(d))
        .on("mouseleave", d => unhighlight({Type: d}));
    return svg.select("g#legend");
  }

  let updateSelection = (selection, animate) => {
    if (selection == null || selection.length == 0 || selection[0].getTime() === selection[1].getTime()) {
      var newData = data;
    } else {
      var newData = data.filter(function(d) {
        return new Date(d["Call Date"]) >= new Date(selection[0])
          && new Date(d["Call Date"]) <= new Date(selection[1]);
      });
    }
    plot.selectAll("rect.bar").remove();
    return draw(newData, animate);
  }

  // Initial first draw
  draw(data, true);

  return updateSelection;
}
