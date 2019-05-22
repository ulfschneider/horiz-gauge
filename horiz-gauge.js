'use babel';

const d3 = require('d3');
const Base64 = require('js-base64').Base64;
const _ = require('underscore');


function validateSettings(settings) {

    if (!settings) {
        throw "No settings";
    }

    if (settings.id) {
        settings.svg = document.getElementById(settings.id);
    }

    if (!settings.svg || settings.svg.tagName.toLowerCase() !== 'svg') {
        throw "No svg";
    }

    settings.d3svg = d3.select(settings.svg);

    settings.fontSize = settings.fontSize ? settings.fontSize : 16;
    settings.fontFamily = settings.fontFamily ? settings.fontFamily : 'sans-serif';
    settings.fraction = settings.fraction ? settings.fraction : 0.0;
    settings.progressWidth = settings.progressWidth ? settings.progressWidth : 200;
    settings.progressHeight = settings.progressHeight ? settings.progressHeight : settings.fontSize + 2;
    settings.borderColor = settings.borderColor ? settings.borderColor : '#ccc';
    settings.emptyColor = settings.emptyColor ? settings.emptyColor : settings.borderColor;
    settings.fractionColor = settings.fractionColor ? settings.fractionColor : '#222';
    settings.fractionExceedColor = settings.fractionExceedColor ? settings.fractionExceedColor : 'red';
    settings.fractionLabelColor = settings.fractionLabelColor ? settings.fractionLabelColor : 'white';
    settings.labelColor = settings.labelColor ? settings.labelColor : settings.fractionColor;
    settings.borderWidth = _.isNumber(settings.borderWidth) ? settings.borderWidth : 0;

    if (_.isUndefined(settings.margin) || _.isEmpty(settings.margin)) {
        settings.margin = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        }
    } else {
        settings.margin.left = settings.margin.left ? settings.margin.left : 0;
        settings.margin.top = settings.margin.top ? settings.margin.top : 0;
        settings.margin.right = settings.margin.right ? settings.margin.right : 0;
        settings.margin.boÌttom = settings.margin.bottom ? settings.margin.bottom : 0;
    }
    if (_.isUndefined(settings.label) || _.isEmpty(settings.label)) {
        settings.label = {
            fraction: '',
            left: '',
            right: ''
        }
    } else {
        settings.label.fraction = settings.label.fraction ? settings.label.fraction : '';
        settings.label.left = settings.label.left ? settings.label.left : '';
        settings.label.right = settings.label.right ? settings.label.right : '';
    }

    if (_.isUndefined(settings.marker)) {
        settings.marker = [];
    } else {
        for (m of settings.marker) {
            m.fraction = m.fraction ? m.fraction : 0;
            m.label = m.label ? m.label : '';
            m.color = m.color ? m.color : '';
            m.position = m.position ? m.position : '';
        }
    }

    if (_.isUndefined(settings.divider)) {
        settings.divider = [];
    } else {
        for (d of settings.divider) {
            d.fraction = d.fraction ? d.fraction : 0;
            d.color = d.color ? d.color : '';
        }
    }

    return settings;
}

function calcHorizFractionPosition(settings, fraction) {
    let f = _.isUndefined(fraction) ? settings.fraction : fraction;
    return Math.max(0, Math.min(settings.progressWidth * f, settings.progressWidth));
}

function determineFractionLabelText(settings) {
    if (settings.label.fraction) {
        return settings.label.fraction;
    } else {
        return Math.round(settings.fraction * 100) + '%';
    }
}

function calcVertTextPosition(settings) {
    return settings.borderWidth + settings.progressHeight / 2 + settings.fontSize / 3;
}

function drawDividers(settings) {

    for (divider of settings.divider) {
        let color = divider.color ? divider.color : settings.emptyColor;
        settings.g.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, divider.fraction))
            .attr('y1', settings.borderWidth)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, divider.fraction))
            .attr('y2', settings.progressHeight + settings.borderWidth)
            .style('stroke-width', 1)
            .style('stroke', color);
    }

}

function drawProgressLabel(settings) {
    let fractionLabel = settings.g.append('text')
        .text(determineFractionLabelText(settings))
        .attr('y', calcVertTextPosition(settings))
        .attr('fill', 'none')
        .attr('font-family', settings.fontFamily)
        .attr('font-size', settings.fontSize);

    let length = fractionLabel.node()
        .getComputedTextLength();
    let fractionPos = calcHorizFractionPosition(settings);
    if (fractionPos + settings.fontSize / 4 + length > settings.progressWidth) {
        fractionLabel.attr('x', settings.borderWidth + fractionPos - length - settings.fontSize / 4)
            .attr('fill', settings.fractionLabelColor);
    } else {
        fractionLabel.attr('x', fractionPos + settings.borderWidth + settings.fontSize / 4)
            .attr('fill', settings.fractionColor);
    }
}

function drawMarkers(settings) {
    for (marker of settings.marker) {
        let color = marker.color ? marker.color : settings.fractionColor;

        settings.g.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
            .attr('y1', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 : 0)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
            .attr('y2', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 + settings.fontSize : -settings.fontSize)
            .style('stroke-width', 1)
            .style('stroke', color);

        if (marker.label) {
            settings.g.append('text')
                .text(marker.label)
                .attr('x', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
                .attr('y', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 + settings.fontSize * 2 : -(settings.fontSize + settings.fontSize / 3))
                .attr('text-anchor', 'middle')
                .attr('fill', color)
                .attr('font-family', settings.fontFamily)
                .attr('font-size', settings.fontSize);
        }
    }
}

function removeGauge(settings) {
    if (settings && settings.svg) {
        let svg = settings.svg;
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }
}


function drawGauge(settings) {
    validateSettings(settings);
    removeGauge(settings);

    let d3svg = settings.d3svg;

    d3svg
        .attr('width', settings.progressWidth + settings.margin.left + settings.margin.right + settings.borderWidth * 2)
        .attr('height', settings.progressHeight + settings.margin.top + settings.margin.bottom + settings.borderWidth * 2);

    settings.g = d3svg.append('g')
        .attr('transform', 'translate(' + (settings.margin.left) + "," + (settings.margin.top) + ')');

    //progress frame
    settings.g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', settings.progressWidth + settings.borderWidth * 2)
        .attr('height', settings.progressHeight + settings.borderWidth * 2)
        .style('fill', settings.borderColor);

    settings.g.append('rect')
        .attr('x', settings.borderWidth)
        .attr('y', settings.borderWidth)
        .attr('width', settings.progressWidth)
        .attr('height', settings.progressHeight)
        .style('fill', settings.emptyColor);

    //progress bar
    settings.g.append('rect')
        .attr('x', settings.borderWidth)
        .attr('y', settings.borderWidth)
        .attr('width', calcHorizFractionPosition(settings))
        .attr('height', settings.progressHeight)
        .style('fill', settings.fraction > 1.0 ? settings.fractionExceedColor : settings.fractionColor);

    //progress bar dividers
    drawDividers(settings);

    //progress label        
    drawProgressLabel(settings);

    //left label
    if (settings.label.left) {
        settings.g.append('text')
            .text(settings.label.left)
            .attr('x', -settings.margin.left)
            .attr('y', calcVertTextPosition(settings))
            .attr('fill', settings.labelColor)
            .attr('font-family', settings.fontFamily)
            .attr('font-size', settings.fontSize);
    }

    //right label
    if (settings.label.right) {
        settings.g.append('text')
            .text(settings.label.right)
            .attr('x', settings.progressWidth + settings.borderWidth * 2 + settings.fontSize / 2)
            .attr('y', calcVertTextPosition(settings))
            .attr('fill', settings.labelColor)
            .attr('font-family', settings.fontFamily)
            .attr('font-size', settings.fontSize);
    }

    drawMarkers(settings);
}


function HorizGauge(settings) {
    this.settings = settings;
}

HorizGauge[Symbol.species] = HorizGauge;

/**
 * Draw the HorizGauge inside of the provided <code>settings.svg</code> DOM tree element.
 */
HorizGauge.prototype.draw = function (settings) {
    if (settings) {
        this.settings = settings;
    }
    drawGauge(this.settings);
}

/**
 * Clear the gauge from the provided <code>settings.svg</code> DOM tree element
 */
HorizGauge.prototype.remove = function () {
    removeGauge(this.settings);
}

/**
 * Draw the HorizGauge inside of the provided <code>settings.svg</code> DOM tree element 
 * and return the result as a string which can be assigned to the SRC attribute of an HTML IMG tag.
 * @returns {string}
 */
HorizGauge.prototype.imageSource = function () {
    this.draw();
    let html = this.settings.svg.outerHTML;
    return 'data:image/svg+xml;base64,' + Base64.encode(html);
}

/**
 * Draw the HorizGauge inside of the provided <code>settings.svg</code> DOM tree element 
 * and return the result as a SVG tag string.
 * @returns {string}
 */
HorizGauge.prototype.svgSource = function () {
    this.draw();
    return this.settings.svg.outerHTML;
}

module.exports = function (settings) {
    return new HorizGauge(settings);
}

