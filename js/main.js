var dateFmt = d3.timeParse("%Y-%m-%d");

let convert = (input) => {
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

d3.csv("data/timebar.csv", convert).then(function draw(data) {
  let update = timeBarChart(data);
  timeAreaChart(data, update);
});

d3.xml("assets/time_types.svg").then((data) => {
  const flow = d3.select('body').select('div#flow');
  flow.select('img').remove();
  flow.node().appendChild(data.documentElement);
});
