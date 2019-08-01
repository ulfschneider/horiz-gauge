'use babel';

const fs = require('fs');
const gauge = require('horiz-gauge');

const NOW = '2018-09-11T12:00:00';
const NUMBER_OF_TEST_IMAGES = 13;
let actuals = [];
let expected = [];
let settings;

test('image 12 with reduced done count and colored marker', () => {
    let settings = makeTestSettings();
    settings.data = makeTestData();
    settings.data.entries[settings.data.entries.length -1].new = 0;
    settings.data.entries[settings.data.entries.length -1].dev = 0;
    settings.data.entries[settings.data.entries.length -1].done = 2;

    settings.shortTermPredict = 2;
    settings.title = 'Testing CFD with reduced done count and colored marker';
    settings.markers = [{
        date: settings.data.entries[1].date
    }, {
        date: settings.data.entries[3].date        
    }, {
        date: settings.data.entries[settings.data.entries.length - 1].date,
        color: 'red'
    }, {
        date: settings.toDate
    }]

    let diagram = cfd(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[12]).toBe(expected[12]);
});