function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    panel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    url = `/metadata/${sample}`;
    d3.json(url).then(function(data){
      Object.entries(data).forEach(([key,value])=>{
        var newTag = panel.append("p3");
        newTag.text(`${key}: ${value}`);
        panel.append("br");
      });
      buildGauge(data["WFREQ"]);
    })
}

function buildGauge(sample) {
  // Trig to calc meter point
  var degrees = 180 - parseFloat(sample)*20, radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
  pathX = String(x),
  space = ' ',
  pathY = String(y),
  pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
  x: [0], y:[0],
   marker: {size: 28, color:'850000'},
   showlegend: false,
   name: 'WFREQ',
   text: sample,
   hoverinfo: 'text+name'},
  { values: [51/9, 51/9, 51/9, 51/9, 51/9, 51/9, 51/9, 51/9, 51/9, 51],
  rotation: 90,
  text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4','2-3','1-2','0-1',''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(6, 100, 0, .5)','rgba(8, 110, 0, .5)','rgba(10, 120, 0, .5)',
   'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
   'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
   'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
   'rgba(255, 255, 255, 0)']},
  labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4','2-3','1-2','0-1',''],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
  }];

  var layout = {
    shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
  };
  
  Plotly.newPlot('gauge', data, layout);

}

function buildCharts(sample) {
  // @TODO: Use `d3.json` to fetch the sample data for the plots
    var url = `/samples/${sample}`;
    // @TODO: Build a Bubble Chart using the sample data
    d3.json(url).then(function(data){
      
      // store entire dict data into a list for several each data
      var newData = [];
      count = data.sample_values.length;
      for (i=0; i<count; i++){
        var eachData = {};
        Object.entries(data).forEach(([key,value])=>{
          eachData[key] = value[i];
        });
        newData.push(eachData);
      };

      //Sort values for top 10 
      newData.sort(function(a,b){
        return parseFloat(b.sample_values) - parseFloat(a.sample_values)
      });
      newData = newData.slice(0,10);

    //Build a Pie Chart for top 10
      var pieData = [{
        values : newData.map(cell => cell.sample_values),
        labels : newData.map(cell => cell.otu_ids),
        type : "pie"
      }];

      var layout = {
        title: '<b>The Top 10</b>',
        height: 500,
        width: 500
      };
      
      Plotly.newPlot("pie",pieData,layout);

    // @TODO: Build a Bubble Chart for each samples
      var bubData = [{
        x : data.otu_ids,
        y : data.sample_values,
        marker :{
        size : data.sample_values,
        color : data.otu_ids
        },
        text : data.otu_labels,
        mode : "markers"
      }];

      Plotly.newPlot("bubble",bubData);
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
