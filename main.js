window.onload = () => {
  // Set the width and height of the SVG container
  const width = 1500;
  const height = 500;

  // Add options to the select dropdowns
  d3.selectAll(".selectVis")
    .selectAll('headers')
    .data(["map", "force"])
    .enter()
    .append('option')
    .text(function (d) { return d; }) // Text displayed in the menu
    .attr("value", function (d) { return d; }) // Corresponding value returned by the button
    .attr("selected", d => d === "map" ? true : null); // Set default selection

  // add Leafleat component on the map container <div>
  var map = L
    .map('map-container')
    .setView([40, -90], 3);   // center position + zoom

  // Add a tile to the map = a background
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Add a svg layer to the map
  L.svg().addTo(map);

  // Function for the forcelayout
  async function forceLayout() {
    const nodes = [];
    const links = [];
    const nodeSet = new Set();

    const data = await d3.csv("./data/flights-airport-5000plus.csv");

    data.forEach((row) => {
      const origin = row.origin;
      const destination = row.destination;
      const count = +row.count;

      // Create links between origin and destination airports
      links.push({ source: origin, target: destination, value: count });

      // Add unique origin and destination nodes
      if (!nodeSet.has(origin)) {
        nodes.push({ id: origin, name: origin });
        nodeSet.add(origin)
      }

      if (!nodeSet.has(destination)) {
        nodes.push({ id: destination, name: destination });
        nodeSet.add(destination)
      }
    });

    nodes.forEach(n => n.value = links.reduce(
      (a, l) => l.source === n.id || l.target === n.id ? a + l.value : a, 0)
    );

    ForceGraph(
      { nodes, links },
      {
        width,
        height,
        linkStrength: d => Math.sqrt(d.data.value) / 10000,
        nodeRadius: d => d.value / 20000,
        linkStrokeWidth: d => d.value / 1000,
      });

    // HINT: you may want to remove traces of leaflet when toggling! 
  }

  // TODO: your map function could go here!  
  // Code for the map layout
  async function mapLayout() {

    // Load the datasets
    const data_airports = await d3.csv("./data/airports.csv");
    const data_flights = await d3.csv("./data/flights-airport-5000plus.csv");

    // create three lists:
    //  one for the circles (markers) containing data for the location and name
    //  one for the lines (flights) containing the source and destination aswell as the count
    //  and one for the airports name just to keep track, could be simplified.
    var markers = [];
    var flights = [];
    var airports = [];

    data_flights.forEach((row) => {
      // sweep the datasets and save the data
      const origin = row.origin;
      const destination = row.destination;
      const count = +row.count;

      const origin_data = data_airports.filter(d => d.iata === origin);
      const destination_data = data_airports.filter(d => d.iata === destination);

      const origin_latitude = +origin_data[0].latitude;
      const destination_latitude = +destination_data[0].latitude;
      const origin_longitude = +origin_data[0].longitude;
      const destination_longitude = +destination_data[0].longitude;

      if (origin_data[0].name !== airports) {
        airports.push(origin_data[0].name)
        markers.push({ name: origin_data[0].name, long: origin_longitude, lat: origin_latitude });
      };

      flights.push({ origin_latitude: origin_latitude, destination_latitude: destination_latitude, origin_longitude: origin_longitude, destination_longitude: destination_longitude, count: count })
    });

    //console.log("Markers", markers)
    //console.log("Airports", airports)
    //console.log("Flights", flights)

    // opacity and stroke scale to encode qunatity data.
    const strokeScale = d3.scaleLinear()
      .domain(d3.extent(flights, d => d.count))   // [min, max]
      .range([0.5, 10]);                            // thin → thick

    const opacityScale = d3.scaleSqrt()
      .domain(d3.extent(flights, d => d.count))
      .range([0.2, 0.9]);

    // Tooltip wich is hide unless you hover on a point.
    const tooltip = d3.select("#map-container")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "6px")
      .style("z-index", 10000)
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Select the svg area and add circles:
    d3.select("#map-container")
      .select("svg")
      .selectAll("flights")
      .data(flights)
      .enter()
      .append("line")
      .attr("class", "flight")
      .attr('x1', function (d) { return map.latLngToLayerPoint([d.origin_latitude, d.origin_longitude]).x })
      .attr('y1', function (d) { return map.latLngToLayerPoint([d.origin_latitude, d.origin_longitude]).y })
      .attr('x2', function (d) { return map.latLngToLayerPoint([d.destination_latitude, d.destination_longitude]).x })
      .attr('y2', function (d) { return map.latLngToLayerPoint([d.destination_latitude, d.destination_longitude]).y })
      .style("stroke", "#1466e1ff")
      .style("opacity", d => opacityScale(d.count))
      .style("stroke-width", d => strokeScale(d.count));

    // Select the svg area and add circles:
    d3.select("#map-container")
      .select("svg")
      .selectAll("myCircles")
      .data(markers)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).x })
      .attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).y })
      .attr("r", 5)
      .style("fill", "#de3f00ff")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("fill-opacity", .7)
      // Functions to put visibility of the dots
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
        <strong>${d.name}</strong><br/>
      `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));


    // Function that update circle position if something change
    // this is necessary since the map is interactive and one can move the map, zoom in and zoom out.
    function update() {
      d3.selectAll(".flight")
        .attr('x1', function (d) { return map.latLngToLayerPoint([d.origin_latitude, d.origin_longitude]).x })
        .attr('y1', function (d) { return map.latLngToLayerPoint([d.origin_latitude, d.origin_longitude]).y })
        .attr('x2', function (d) { return map.latLngToLayerPoint([d.destination_latitude, d.destination_longitude]).x })
        .attr('y2', function (d) { return map.latLngToLayerPoint([d.destination_latitude, d.destination_longitude]).y });

      d3.selectAll("circle")
        .attr("cx", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).x })
        .attr("cy", function (d) { return map.latLngToLayerPoint([d.lat, d.long]).y });
    }

    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update)

  }

  // Function that draws according to the selection
  function draw(layoutType) {
    d3.select("#visualization-container").html("");
    if (layoutType === "force") {
      forceLayout();
      d3.select("#map-container").style("display", "none");

    } else if (layoutType === "map") {
      // TODO: mapLayout();
      mapLayout();
      d3.select("#map-container").style("display", "block");
    }
  }


  // Setting the map option as the default
  d3.selectAll(".selectVis").on("change", function (d) {
    var selectedOption = d3.select("#selectVis").property("value");
    draw(selectedOption); 
  })
  draw("map");
};
