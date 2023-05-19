var width =   800;
var height =  800;
// document.body.style.overflow = 'hidden';

var projection = d3.geoMercator()
.center([-0.170, 51.45])
    .scale(50000)
    .translate([width / 2, height / 2]);
  

var path = d3.geoPath().projection(projection);

var svg = d3.select("svg")
.attr("width",width)
.attr("height",height);

function ready(data) 
{
    d3.select('#LondonMap g.A')
      .selectAll('path')
       .data(data.features)
       .enter()
       .append("path")
       .attr("d", function(d) {
        return path(d);
      }).style("fill","#b8b8b8").style("stroke","	#F0FFFF");
      d3.csv("london_stations.csv", function(lstData){
      var svg = d3.select("svg")
    .attr("width",width)
    .attr("height",height)
    .call(d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform)
     }));
        svg
        .selectAll('myCircles')
      .data(lstData)
      .enter()
      .append("circle")
      .attr("r", 2)
      //.attr('stroke', 'black')
      .style("fill", "#000")
      .attr("cx", function (d) {
        //console.log(d.longitude, d.latitude); // -77.39215851 37.28969193
        coords = projection([d.longitude, d.latitude]) 
        return coords[0];
      })
      .attr("cy", function (d) {
        coords = projection([d.longitude, d.latitude])
        return coords[1];
      })
    });
    
};

d3.json("london_boroughs.json",function(err, LndBorghs) {
    ready(LndBorghs);
  });

  function DrawLinks(LondData)
  {
    console.log(LondData);
    var link = []
    LondData.forEach(function(row){
      source = [+row.start_longitude, +row.start_latitude]
      target = [+row.end_longitude, +row.end_latitude]
      topush = {type: "LineString", coordinates: [source, target]}
      link.push(topush)
    })
    // Add the path
    svg.selectAll("myPath")
      .data(link)
      .enter()
      .append("path")
        .attr("d", function(d){ return path(d)})
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", 1)

}
var index = 0;
d3.csv("PreProcessedLondon.csv", function(err,LondonData) {
  d3.select("#bt").on("click", () => {
    var newData = LondonData.slice(index, index + 100);
    index += 100;
    DrawLinks(newData);
  })
});