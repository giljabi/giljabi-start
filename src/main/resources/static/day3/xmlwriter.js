let NEWLINE = '\n';

function makeGpxData(filename, speed, wpt, trkpt) {
    let xmlDataParts = [];
    xmlDataParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlDataParts.push('<gpx creator="giljabi" version="1.1"');
    xmlDataParts.push(' xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"');
    xmlDataParts.push(' xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"');
    xmlDataParts.push(' xmlns="http://www.topografix.com/GPX/1/1"');
    xmlDataParts.push(' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">');

    xmlDataParts.push(`<metadata>`);
    xmlDataParts.push(` <name>${filename}</name>`);
    xmlDataParts.push(` <link href="https://giljabi.kr" />`);
    xmlDataParts.push(` <desc>giljabi</desc>`);
    xmlDataParts.push(` <copyright>giljabi.kr</copyright>`);
    xmlDataParts.push(` <speed>${speed}</speed>`);
    xmlDataParts.push(` <time>${trkpt[0].time}</time>`);
    xmlDataParts.push(`</metadata>`);

    wpt.forEach(w => {
        xmlDataParts.push(`<wpt lat="${w.lat}" lon="${w.lon}">`);
        xmlDataParts.push(` <name>${w.name}</name>`);
        xmlDataParts.push(` <sym>${w.sym}</sym>`);
        xmlDataParts.push(`</wpt>`);
    });

    xmlDataParts.push(`<trk>`);
    xmlDataParts.push(` <trkseg>`);
    trkpt.forEach(pt => {
        xmlDataParts.push(` <trkpt lat="${pt.lat}" lon="${pt.lon}">`);
        xmlDataParts.push(` <ele>${pt.ele}</ele>`);
        xmlDataParts.push(` <time>${pt.time}</time>`);
        xmlDataParts.push(` <dist>${pt.dist}</dist>`);   //기본 속성이 없으나 확장속성을 사용하지 않고 사용
        xmlDataParts.push(` </trkpt>`);
    });
    xmlDataParts.push(` </trkseg>`);
    xmlDataParts.push(`</trk>`);
    xmlDataParts.push(`</gpx>`);
    return xmlDataParts.join(NEWLINE);
}
