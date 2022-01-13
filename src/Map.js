import React from "react";
import {
  ComposableMap,
  ZoomableGlobe,
  Geographies,
  Markers,
  Marker,
  Geography
} from "react-simple-maps";
import { Motion, spring } from "react-motion";

const mapStyles = {
  width: "90%",
  height: "auto",
  //background: "#0000FF",
};

const globeSize = 250;
const width = 500;

// Coordinates are reversed!
const markers = [
  { coordinates: [-73.9808, 40.7648] },
  { coordinates: [-9.13333, 38.71667] },
  { coordinates: [19.03991, 47.49801] },
]

const Map = ({ center, waterColor, continentColor, lineColor, markerSize, markerColor }) => (
  <div id="testWrapper">
    <Motion
      defaultStyle={{
        x: center[0],
        y: center[1]
      }}
      style={{
        x: spring(center[0]),
        y: spring(center[1])
      }}
    >
      {({ x, y }) => (
        <ComposableMap
          width={width}
          height={width}
          projection="orthographic"
          projectionConfig={{ scale: globeSize }}
          style={mapStyles}
        >
          <ZoomableGlobe center={[x, y]}>
            <circle
              cx={width/2}
              cy={width/2}
              r={globeSize}
              fill={waterColor}
              stroke="#CFD8DC"
            />
            <Geographies
              disableOptimization
              geography="https://unpkg.com/world-atlas@1.1.4/world/110m.json"
            >
              {(geos, proj) =>
                geos.map((geo, i) => (
                  <Geography
                    key={geo.id + i}
                    geography={geo}
                    projection={proj}
                    style={{
                      default: { fill: continentColor, stroke: lineColor }
                    }}
                  />
                ))
              }
            </Geographies>
            <Markers>
              {markers.map(marker => (
                <Marker
                  marker={marker}
                  style={{
                    hidden: { display: "none" }
                  }}
                >
                  <circle cx={0} cy={0} r={markerSize} fill={markerColor} stroke="#FFF" />
                </Marker>
              ))}
          </Markers>
          </ZoomableGlobe>
        </ComposableMap>
      )}
    </Motion>
  </div>
);

export default Map;
