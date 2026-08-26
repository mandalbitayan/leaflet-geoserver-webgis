// 1. MAP


const map = L.map("map").setView(
    [40.681057, -73.924255],
    10
);



// 2. OPENSTREETMAP BASEMAP


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);



// 3. MARKER


const marker = L.marker(
    [40.7128, -74.0060]
).addTo(map);



// 4. GEOSERVER


// Workspace = nyc

const geoserverURL =
    "https://nottingham-joins-cardiovascular-segment.trycloudflare.com/geoserver/nyc/wms";

const workspace =
    "nyc";


// 5. WMS LAYERS



// ---------------------------------
// NYC HOMICIDES
// ---------------------------------

const nyc_homicides = L.tileLayer.wms(
    geoserverURL,
    {
        layers:
            workspace + ":nyc_homicides",

        format:
            "image/png",

        transparent:
            true,

        version:
            "1.1.1"
    }
);


// -------------------------------------
// NYC NEIGHBORHOODS
// -------------------------------------

const nyc_neighborhoods = L.tileLayer.wms(
    geoserverURL,
    {
        layers:
            workspace + ":nyc_neighborhoods",

        format:
            "image/png",

        transparent:
            true,

        version:
            "1.1.1"
    }
);


// ------------------------------------------------------
// NYC CENSUS BLOCKS
// ------------------------------------------------------

const nyc_census_blocks = L.tileLayer.wms(
    geoserverURL,
    {
        layers:
            workspace + ":nyc_census_blocks",

        format:
            "image/png",

        transparent:
            true,

        version:
            "1.1.1"
    }
);


// ------------------------------------------------------
// NYC STREETS
// ------------------------------------------------------

const nyc_streets = L.tileLayer.wms(
    geoserverURL,
    {
        layers:
            workspace + ":nyc_streets",

        format:
            "image/png",

        transparent:
            true,

        version:
            "1.1.1"
    }
);


// ------------------------------------------------------
// NYC SUBWAY STATIONS
// ------------------------------------------------------



const nyc_subway_stations = L.tileLayer.wms(
    geoserverURL,
    {
        layers:
            workspace + ":nyc_subway_stations",

        format:
            "image/png",

        transparent:
            true,

        version:
            "1.1.1"
    }
);


// ======================================================
// 6. LAYER CONTROL
// ======================================================

const overlayMaps = {

    "NYC Homicides":
        nyc_homicides,

    "NYC Subway Stations":
        nyc_subway_stations,

    "NYC Neighborhoods":
        nyc_neighborhoods,

    "NYC Census Blocks":
        nyc_census_blocks,

    "NYC Streets":
        nyc_streets
};


L.control.layers(
    null,
    overlayMaps,
    {
        collapsed: true
    }
).addTo(map);



// 7. WMS LAYERS ARRAY


const wmsLayers = [

    {
        layer:
            nyc_homicides,

        name:
            "NYC Homicides"
    },

    {
        layer:
            nyc_subway_stations,

        name:
            "NYC Subway Stations"
    },

    {
        layer:
            nyc_neighborhoods,

        name:
            "NYC Neighborhoods"
    },

    {
        layer:
            nyc_census_blocks,

        name:
            "NYC Census Blocks"
    },

    {
        layer:
            nyc_streets,

        name:
            "NYC Streets"
    }

];



// 8. GET FEATURE INFO URL


function getFeatureInfoUrl(
    layer,
    latlng
) {

    // Click pixel position

    const point =
        map.latLngToContainerPoint(
            latlng,
            map.getZoom()
        );


    // Map size

    const size =
        map.getSize();


    // Map bounding box

    const bounds =
        map.getBounds();


    // GetFeatureInfo parameters

    const params = {

        service:
            "WMS",

        version:
            "1.1.1",

        request:
            "GetFeatureInfo",

        layers:
            layer.wmsParams.layers,

        query_layers:
            layer.wmsParams.layers,

        styles:
            "",

        bbox:
            bounds.toBBoxString(),

        width:
            size.x,

        height:
            size.y,

        srs:
            "EPSG:4326",

        format:
            "image/png",

        info_format:
            "application/json",

        feature_count:
            10,

        x:
            Math.round(point.x),

        y:
            Math.round(point.y)

    };


    return (
        layer._url +
        "?" +
        new URLSearchParams(
            params
        ).toString()
    );
}



// 9. CREATE POPUP TABLE


function createPopupContent(
    feature,
    layerName
) {

    const properties =
        feature.properties;


    let html = `

        <div style="
            max-width:450px;
            max-height:400px;
            overflow:auto;
        ">

            <h3 style="
                margin:0 0 10px 0;
                padding-bottom:8px;
                border-bottom:2px solid #333;
            ">
                ${layerName}
            </h3>

            <table style="
                border-collapse:collapse;
                width:100%;
                font-size:13px;
            ">

    `;


    // Every attribute field

    for (
        const key in properties
    ) {

        let value =
            properties[key];


        if (
            value === null ||
            value === undefined
        ) {

            value = "";

        }


        html += `

            <tr>

                <td style="
                    border:1px solid #ccc;
                    padding:6px;
                    font-weight:bold;
                    background:#f3f3f3;
                    width:40%;
                ">
                    ${key}
                </td>

                <td style="
                    border:1px solid #ccc;
                    padding:6px;
                ">
                    ${value}
                </td>

            </tr>

        `;

    }


    html += `

            </table>

        </div>

    `;


    return html;
}



// 10. MAP CLICK → GETFEATUREINFO


map.on(
    "click",
    async function (e) {


        // ----------------------------------------------
        // Find active WMS layers
        // ----------------------------------------------

        const activeLayers =
            wmsLayers.filter(
                function (item) {

                    return map.hasLayer(
                        item.layer
                    );

                }
            );


        // No active WMS layer

        if (
            activeLayers.length === 0
        ) {

            return;

        }


        // ----------------------------------------------
        // Loading popup
        // ----------------------------------------------

        const popup =
            L.popup({
                maxWidth:500
            })
            .setLatLng(
                e.latlng
            )
            .setContent(
                "<b>Loading feature information...</b>"
            )
            .openOn(map);


        // ----------------------------------------------
        // Request for each active layer
        // ----------------------------------------------

        const requests =
            activeLayers.map(
                async function (item) {


                    const url =
                        getFeatureInfoUrl(
                            item.layer,
                            e.latlng
                        );


                    console.log(
                        "GetFeatureInfo URL:",
                        url
                    );


                    try {


                        const response =
                            await fetch(
                                url
                            );


                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                "HTTP " +
                                response.status
                            );

                        }


                        const data =
                            await response.json();


                        return {

                            layerName:
                                item.name,

                            data:
                                data

                        };


                    }

                    catch (error) {


                        console.error(
                            "GetFeatureInfo error:",
                            item.name,
                            error
                        );


                        return null;

                    }

                }
            );


        // Wait for all requests

        const results =
            await Promise.all(
                requests
            );


        // ----------------------------------------------
        // Create popup HTML
        // ----------------------------------------------

        let popupHTML =
            "";


        results.forEach(
            function (result) {


                if (
                    result &&
                    result.data &&
                    result.data.features &&
                    result.data.features.length > 0
                ) {


                    result.data.features.forEach(
                        function (feature) {


                            popupHTML +=
                                createPopupContent(
                                    feature,
                                    result.layerName
                                );


                            popupHTML += `

                                <hr style="
                                    margin:15px 0;
                                ">

                            `;


                        }
                    );

                }

            }
        );


        // ----------------------------------------------
        // No feature
        // ----------------------------------------------

        if (
            popupHTML === ""
        ) {


            popup.setContent(
                `

                <div style="
                    padding:5px;
                ">

                    <b>
                        No feature found here.
                    </b>

                </div>

                `
            );


            return;

        }


        // ----------------------------------------------
        // Show attributes
        // ----------------------------------------------

        popup.setContent(
            popupHTML
        );

    }
);



// 11. GEOCODER


L.Control.geocoder({

    defaultMarkGeocode:
        true

}).addTo(map);