const map = L.map("map").setView([40.681057, -73.924255],10);

const marker = L.marker(
    [40.7128, -74.0060]
).addTo(map)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"&copy,open street map contributors"
}).addTo(map);

let popup = L.popup()

function onMapClick(e){
    popup
    .setLatLng(e.latlng)
    .setContent(`<h1>${e.latlng.toString()}</h1>`)
    .openOn(map)
}

map.on("click",onMapClick)



const nyc_homicides = L.tileLayer.wms(
    "http://localhost:8080/geoserver/NYC_subway_stations/wms",
    {
        layers: "NYC_subway_stations:nyc_homicides",
        format: "image/png",
        transparent: true,
        version: "1.1.0"
    }
);

const nyc_subway_stations = L.tileLayer.wms(
    "http://localhost:8080/geoserver/NYC_subway_stations/wms",
    {
        layers: "NYC_subway_stations:nyc_subway_stations",
        format: "image/png",
        transparent: true,
        version: "1.1.0"
    }
);

const nyc_neighborhoods = L.tileLayer.wms(
    "http://localhost:8080/geoserver/NYC_subway_stations/wms",
    {
        layers: "NYC_subway_stations:nyc_neighborhoods",
        format: "image/png",
        transparent: true,
        version: "1.1.0"
    }
);
const nyc_census_blocks = L.tileLayer.wms(
    "http://localhost:8080/geoserver/NYC_subway_stations/wms",
    {
        layers: "NYC_subway_stations:nyc_census_blocks",
        format: "image/png",
        transparent: true,
        version: "1.1.0"
    }
);

const nyc_streets = L.tileLayer.wms(
    "http://localhost:8080/geoserver/NYC_subway_stations/wms",
    {
        layers: "NYC_subway_stations:nyc_streets",
        format: "image/png",
        transparent: true,
        version: "1.1.0"
    }
);


let overlaymaps = {
    "Nyc_homicides":nyc_homicides,
    "Nyc_subway_stations":nyc_subway_stations,
    "Nyc_neighborhoods":nyc_neighborhoods,
    "Nyc_census_blocks":nyc_census_blocks,
    "Nyc_streets":nyc_streets
};

L.control.layers(null, overlaymaps, {
  collapsed: true
}).addTo(map);


L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(map);

map.on("click", function (e) {

    const point = map.latLngToContainerPoint(e.latlng, map.getZoom());
    const size = map.getSize();
    const bounds = map.getBounds();

    const url =
        "http://localhost:8080/geoserver/NYC_subway_stations/wms" +
        L.Util.getParamString({
            service: "WMS",
            request: "GetFeatureInfo",
            version: "1.1.1",
            layers: "NYC_subway_stations:nyc_neighborhoods",
            query_layers: "NYC_subway_stations:nyc_neighborhoods",
            styles: "",
            bbox: bounds.toBBoxString(),
            width: size.x,
            height: size.y,
            srs: "EPSG:4326",
            format: "image/png",
            info_format: "application/json",
            x: Math.round(point.x),
            y: Math.round(point.y)
        });

    fetch(url)
        .then(res => res.json())
        .then(data => {

            if (data.features.length === 0) {
                return;
            }

            const props = data.features[0].properties;

            let html = "<table border='1' cellpadding='5'>";

            for (let key in props) {
                html += `
                    <tr>
                        <td><b>${key}</b></td>
                        <td>${props[key]}</td>
                    </tr>
                `;
            }

            html += "</table>";

            L.popup()
                .setLatLng(e.latlng)
                .setContent(html)
                .openOn(map);

        });

});




