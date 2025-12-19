# DataVis Assignment 3 - Airports and Flights Data Visualization

A D3.js-based interactive data visualization project showcasing networks data with simple interactivity. 

## Overview

This project provides an interactive dashboard with two visualizations:

1. **Map** - Visulize the flights on the USA with the name of the airports and the amount of flights encoded visually.
2. **Force** - Interactive visualization of the cluster of flights.

## Features

### Map Plot
- The width and opacity of the lines correspond to the amount of flights between the airports
- When hover over the dots can visualize on a tooltip the name of the airport
- Interactive map

### Force Plot
- Displays clusters that can be moved around two identify conections between the different airports
- Size of circles represent the amount of flights on an airport


## Github page
Follow the link https://josericardor.github.io/datavis-a3/ to find the live github page of the project.

## Project Structure

```
datavis-a3/
├── index.html                      # Main HTML file with chart containers
├── main.js                         # D3.js visualization logic
├── force.js                        # D3.js visualization logic
├── style.css                       # CSS styling
├── airports.csv                    # Dataset 1
├── flights-airport-5000plus.csv    # Dataset 2
├── d3.v5.min.js                    # D3.js library
└── README.md                       # This file
```

## References
This work was based mostly on the examples provided by:

For the use of the node graph and understanding the force layout:

- [Force directed graph component](https://observablehq.com/@d3/force-directed-graph-component)

For using Leaflet and overlaying components

- [LEaflet bubblemap](https://d3-graph-gallery.com/graph/bubblemap_leaflet_basic.html)

* The documentation of this code was partly AI generated and corrected by the author