'use babel';

const fs = require('fs');
const gauge = require('horiz-gauge');

const NUMBER_OF_TEST_IMAGES = 7;
let actuals = [];
let expected = [];
let settings;

function makeTestSettings() {
    settings = {};
    settings.svg = document.createElement('svg');
    return settings;
}

function writeTestFile(path, content) {
    fs.writeFile(path, content);
}

function readTestFile(path) {
    return fs.readFileSync(path).toString();
}

function readExpectedFiles(folder, count) {
    let expected = [];
    for (let i = 0; i < count; i++) {
        expected.push(readTestFile(folder + '/expect' + i + '.svg'));
    }
    return expected;
}

beforeAll(() => {
    expected = readExpectedFiles('./test', NUMBER_OF_TEST_IMAGES);
});

test('image 0, empty defaults', () => {
    let settings = makeTestSettings();
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[0]).toBe(expected[0]);
});

test('image 1, 50%', () => {
    let settings = makeTestSettings();
    settings.fraction = 0.5;
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[1]).toBe(expected[1]);
});

test('image 2, 150%, divider at 100%', () => {
    let settings = makeTestSettings();
    settings.fraction = 1.5;
    settings.dividers = [{ fraction: 1.0 }];
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[2]).toBe(expected[2]);
});

test('image 3, 150%, divider at 100%, marker', () => {
    let settings = makeTestSettings();
    settings.fraction = 1.5;
    settings.fractionExceedColor = 'gray';
    settings.dividers = [{ fraction: 1.0 }];
    settings.markers = [{ fraction: 1.0, label: '100%', color: 'gray' }];
    settings.margin = { top: 50 };
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[3]).toBe(expected[3]);
});

test('image 4, margins and labels', () => {
    let settings = makeTestSettings();
    settings.fraction = 1.5;
    settings.fractionExceedColor = 'gray';
    settings.dividers = [{ fraction: 1.0 }];
    settings.markers = [
        { fraction: 1.0, label: '100%', color: 'red', textAnchor: 'end' },
        { fraction: 0.5, label: '50%', position: 'bottom', color: 'green', distance: 25, textAnchor: 'start' }];
    settings.margin = { top: 50, right: 160, bottom: 80, left: 100 }
    settings.leftLabel = { label: 'left label', color: 'grey' };
    settings.rightLabel = { label: 'right label', color: 'grey', textAnchor: 'end' };
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[4]).toBe(expected[4]);
});

test('image 5, edge dividers and markers', () => {
    let settings = makeTestSettings();
    settings.fraction = 1.5;
    settings.fractionColor = 'red';
    settings.fractionExceedColor = 'gray';
    settings.dividers = [
        { fraction: 1.0 }
    ];
    settings.markers = [
        { fraction: 0, label: 'START', position: 'top', textAnchor: 'start' , distance: 15},
        { fraction: 1.0, label: '100%', color: 'red', textAnchor: 'end' },
        { fraction: 1.5, label: 'END', position: 'BOTTOM', textAnchor: 'middle' },
        { fraction: 0.5, label: '50%', position: 'bottom', color: 'green', distance: 25, textAnchor: 'start' }];
    settings.margin = { top: 50, right: 160, bottom: 80, left: 100 }
    settings.leftLabel = { label: 'left label', color: 'grey' };
    settings.rightLabel = { label: 'right label', color: 'grey', textAnchor: 'end' };
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[5]).toBe(expected[5]);
});

test('image 6, height and width', () => {
    let settings = makeTestSettings();
    settings.fraction = 0.7;
    settings.fractionColor = 'cornflowerblue';

    settings.fontSize =  10;
    settings.fontFamily = 'monospace';
    settings.progressWidth = 300;
    settings.progressHeight = 10;
    settings.borderColor = 'gray';
    settings.emptyColor = 'yellow';
    settings.borderWidth = 4;

    settings.dividers = [
        { fraction: 1.0 }
    ];
    settings.markers = [
        { fraction: 0, label: 'START', position: 'top', textAnchor: 'start' },
        { fraction: 1.0, label: '100%', color: 'red', textAnchor: 'end' },
        { fraction: 1.5, label: 'END', position: 'BOTTOM', textAnchor: 'middle' },
        { fraction: 0.5, label: '50%', position: 'bottom', color: 'green', distance: 25, textAnchor: 'start' }];
    settings.margin = { top: 50, right: 80, bottom: 80, left: 80 }
    settings.leftLabel = { label: 'left label', color: 'grey' };
    settings.rightLabel = { label: 'right label', color: 'grey', textAnchor: 'end' };
    let diagram = gauge(settings);
    let actual = diagram.svgSource();
    actuals.push(actual);
    expect(actuals[6]).toBe(expected[6]);
});

test('write test results into file', () => {
    let testFileContent = '<!DOCTYPE html>\n<meta charset="utf-8">\n'
        + '<body><style>* {font-family:sans-serif;}\n'
        + '.image-set {border-bottom: 1px solid black; padding:2em 0;}\n'
        + '.label {text-transform:uppercase; color:white; background:gray; margin:1em 0em;}\n'
        + '.label.mismatch {color:white; background:red;}\n'
        + '.label.expected {color:white; background:green;}\n'
        + '.box {display:inline-block; margin-right: 1em;}</style>'
        + '<h1>Expected Test Results with Actual Values</h1>';

    for (let i = 0; i < actuals.length; i++) {
        writeTestFile('./test/actual' + i + '.svg', actuals[i]);
        let match = expected[i] == actuals[i];
        if (match) {
            testFileContent += '<div class="image-set"><div class="box"><div class="label">Expected ' + i + '</div>' + expected[i] + '</div>'
                + '<div class="box"><div class="label expected">Actual ' + i + ' is as expected</div>' + actuals[i] + '</div></div>';
        } else {
            testFileContent += '<div class="image-set"><div class="box"><div class="label">Expected ' + i + '</div>' + expected[i] + '</div>'
                + '<div class="box"><div class="label mismatch">Actual ' + i + ' has a mismatch</div>' + actuals[i] + '</div></div>';

        }
    }
    testFileContent += '</body';
    writeTestFile('./test/horiz-gauge.html', testFileContent);

    //have a look at ./test/horiz-gauge.html to view the result
});
