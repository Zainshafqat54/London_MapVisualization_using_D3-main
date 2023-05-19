var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
    
    var projection = d3.geoAlbers()
        .translate([width / 2, height / 2])
        .scale(1280);
    
    var radius = d3.scaleSqrt()
        .domain([0, 100])
        .range([0, 14]);
    
    var path = d3.geoPath()
        .projection(projection)
        .pointRadius(2.5);
    
    var voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, height + 1]]);
    
    d3.queue()
        .defer(d3.json, "london_boroughs.json")
        .defer(d3.csv, "stations.csv", stationsData)
        .defer(d3.csv, "path.csv", flightData)
        .await(ready);
    
    function ready(error, us, stations, routes) {
      if (error) throw error;
    
      var stations_location = d3.map(stations, function(d) { return d.iata; });
    
      routes.forEach(function(route) {
        var source = stations_location.get(route.origin),
            target = stations_location.get(route.destination);
        source.arcs.coordinates.push([source, target]);
        target.arcs.coordinates.push([target, source]);
      });
    
    //   stations = stations
    //       .filter(function(d) { return d.arcs.coordinates.length; });
    
      svg.append("path")
          .datum({type: "MultiPoint", coordinates: stations})
          .attr("class", "station-dots")
          .attr("d", path);
    
      var station = svg.selectAll(".station")
        .data(stations)
        .enter().append("g")
          .attr("class", "station");
    
      station.append("title")
      .attr("class", "tooltip")				
        .style("opacity", 0)
          .text(function(d) { return "Station-id: "+ d.start_station_id 
          + "\n"
          +"Station-name: "+ d.start_station_name
          + "\n"
          +"Date: "+ d.Date
          + "\n"
          +"Other Stations Traveled: "+(+(d.arcs.coordinates.length/2))
          ; });
    
      station.append("path")
          .attr("class", "station-arc")
          .attr("d", function(d) { return path(d.arcs); });
    
      station.append("path")
          .data(voronoi.polygons(stations.map(projection)))
          .attr("class", "station-cell")
          .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
          
    }
    
    function stationsData(d) {
      d[0] = +d.longitude;
      d[1] = +d.latitude;
      d.arcs = {type: "MultiLineString", coordinates: []};
      return d;
    }
    
    function flightData(d) {
      d.count = +d.count;
      return d;
    }