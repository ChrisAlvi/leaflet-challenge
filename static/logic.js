// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Create the map object with center and zoom options.
let map = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5,
    layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups for earthquakes and tectonic plates.
let earthquakeLayer = new L.LayerGroup();
let tectonicPlatesLayer = new L.LayerGroup();

// Define base maps and overlays.
let baseMaps = {
    "Street Map": streetMap,
    "Base Map": basemap
};

let overlays = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};

// Add a control to toggle layers.
L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

// Function to determine marker style.
function styleInfo(feature) {
    return {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Function to determine color based on depth.
function getColor(depth) {
    return depth > 90 ? "#d73027" :
           depth > 70 ? "#fc8d59" :
           depth > 50 ? "#fee08b" :
           depth > 30 ? "#d9ef8b" :
           depth > 10 ? "#91cf60" : "#1a9850";
}

// Function to determine marker radius based on magnitude.
function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1;
}

// Make a request to get earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(data => {
    L.geoJson(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng),
        style: styleInfo,
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                `<strong>Location:</strong> ${feature.properties.place}<br>
                <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
            );
        }
    }).addTo(earthquakeLayer);
    earthquakeLayer.addTo(map);
});

// Create a legend control object.
let legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depthLevels = [-10, 10, 30, 50, 70, 90];
    let colorScale = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];
    div.innerHTML += "<h4>Depth (km)</h4>";
    for (let i = 0; i < depthLevels.length; i++) {
        div.innerHTML += `<i style="background:${colorScale[i]}"></i> ` +
            `${depthLevels[i]}${depthLevels[i + 1] ? "&ndash;" + depthLevels[i + 1] : "+"}<br>`;
    }
    return div;
};
legend.addTo(map);

// OPTIONAL: Step 2
// Make a request to get Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(plateData => {
    L.geoJson(plateData, {
        color: "#ff7800",
        weight: 2
    }).addTo(tectonicPlatesLayer);
    tectonicPlatesLayer.addTo(map);
});
