
let gMap;

function initMap() {
    let mapContainer = document.getElementById('map');
    let mapOption = {
        center: new kakao.maps.LatLng(37.56683546665817, 126.9786607449023),	//지도의 중심위치
        level: 12
    };
    gMap = new kakao.maps.Map(mapContainer, mapOption);
    gMap.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
}


function clickGpxLoadButton() {
    $('#loadButton').on('click', function () {
        const file = $('#fileUpload')[0].files[0];

        if (!file) {
            alert('Please select a GPX file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            let readXmlfile = $($.parseXML(fileContent.replace(/&/g, '&amp;')));
            const waypoints = readXmlfile.find('wpt');
            const trkseg = readXmlfile.find('trkseg');
            const trkpt = readXmlfile.find('trkpt');

            $('#gpxOutput').text(`waypoint:${waypoints.length}, trkseg:${trkseg.length}, trkpt:${trkpt.length}`);
        };
        reader.readAsText(file);
    });
}

//https://www.topografix.com/GPX/1/1/

$(document).ready(function () {
    initMap();
    clickGpxLoadButton();
});
