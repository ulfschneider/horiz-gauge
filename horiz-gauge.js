'use babel';

const d3 = require('d3');
const Base64 = require('js-base64').Base64;
const _ = require('underscore');


function validateSettings(settings) {


    if (!settings) {
        throw "No settings";
    }

    if (!settings.svg || settings.svg.tagName.toLowerCase() !== 'svg') {
        throw "No svg";
    }

    settings.d3svg = d3.select(settings.svg);

    settings.fraction = settings.fraction ? settings.fraction : 0.0;
    settings.progressWidth = settings.progressWidth ? settings.progressWidth : 300;
    settings.progressHeight = settings.progressHeight ? settings.progressHeight : 26;
    settings.borderColor = settings.borderColor ? settings.borderColor : 'lightgray';
    settings.emptyColor = settings.emptyColor ? settings.emptyColor : 'lightgray';
    settings.fractionColor = settings.fractionColor ? settings.fractionColor : 'black';
    settings.fractionExceedColor = settings.fractionExceedColor ? settings.fractionExceedColor : 'red';
    settings.fractionLabelColor = settings.fractionLabelColor ? settings.fractionLabelColor : 'white';
    settings.labelColor = settings.labelColor ? settings.labelColor : 'black';
    settings.borderWidth = _.isNumber(settings.borderWidth) ? settings.borderWidth : 0;
    settings.textSize = settings.textSize ? settings.textSize : 16;
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
    return settings.borderWidth + settings.progressHeight / 2 + settings.textSize / 3;
}

function drawDividers(settings) {

    for (divider of settings.divider) {
        let color = divider.color ? divider.color : 'white';
        settings.d3svg.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, divider.fraction))
            .attr('y1', settings.borderWidth)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, divider.fraction))
            .attr('y2', settings.progressHeight + settings.borderWidth)
            .style('stroke-width', 1)
            .style('stroke', color);
    }

}

function drawProgressLabel(settings) {
    let fractionLabel = settings.d3svg.append('text')
        .text(determineFractionLabelText(settings))
        .attr('y', calcVertTextPosition(settings))
        .attr('fill', 'none')
        .attr('font-family', 'sans-serif')
        .attr('font-size', settings.textSize);

    let length = fractionLabel.node()
        .getComputedTextLength();
    let fractionPos = calcHorizFractionPosition(settings);
    if (fractionPos + settings.textSize / 4 + length > settings.progressWidth) {
        fractionLabel.attr('x', settings.borderWidth + fractionPos - length - settings.textSize / 4)
            .attr('fill', settings.fractionLabelColor);
    } else {
        fractionLabel.attr('x', fractionPos + settings.borderWidth + settings.textSize / 4)
            .attr('fill', settings.fractionColor);
    }
}

function drawMarkers(settings) {
    for (marker of settings.marker) {
        let color = marker.color ? marker.color : settings.fractionColor;

        settings.d3svg.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
            .attr('y1', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 : 0)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
            .attr('y2', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 + settings.textSize : -settings.textSize)
            .style('stroke-width', 1)
            .style('stroke', color);

        if (marker.label) {
            settings.d3svg.append('text')
                .text(marker.label)
                .attr('x', settings.borderWidth + calcHorizFractionPosition(settings, marker.fraction))
                .attr('y', marker.position == 'BOTTOM' ? settings.progressHeight + settings.borderWidth * 2 + settings.textSize * 2 : -(settings.textSize + settings.textSize / 3))
                .attr('text-anchor', 'middle')
                .attr('fill', color)
                .attr('font-family', 'sans-serif')
                .attr('font-size', settings.textSize);
        }
    }
}


function drawGauge(settings) {

    let d3svg = settings.d3svg;

    d3svg.append('svg')
        .attr('id', settings.id + 'svg')
        .attr('width', settings.progressWidth + settings.margin.left + settings.margin.right + settings.borderWidth * 2)
        .attr('height', settings.progressHeight + settings.margin.top + settings.margin.bottom + settings.borderWidth * 2)
        .append('g')
        .attr('transform', 'translate(' + (settings.margin.left) + "," + (settings.margin.top) + ')');

    //progress frame
    d3svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', settings.progressWidth + settings.borderWidth * 2)
        .attr('height', settings.progressHeight + settings.borderWidth * 2)
        .style('fill', settings.borderColor);

    d3svg.append('rect')
        .attr('x', settings.borderWidth)
        .attr('y', settings.borderWidth)
        .attr('width', settings.progressWidth)
        .attr('height', settings.progressHeight)
        .style('fill', settings.emptyColor);

    //progress bar
    d3svg.append('rect')
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
        d3svg.append('text')
            .text(settings.label.left)
            .attr('x', -settings.textSize / 2)
            .attr('y', calcVertTextPosition(settings))
            .attr('text-anchor', 'end')
            .attr('fill', settings.labelColor)
            .attr('font-family', 'sans-serif')
            .attr('font-size', settings.textSize);
    }

    //right label
    if (settings.label.right) {
        d3svg.append('text')
            .text(settings.label.right)
            .attr('x', settings.progressWidth + settings.borderWidth * 2 + settings.textSize / 2)
            .attr('y', calcVertTextPosition(settings))
            .attr('fill', settings.labelColor)
            .attr('font-family', 'sans-serif')
            .attr('font-size', settings.textSize);
    }

    drawMarkers(settings);
}


function HorizGauge(settings) {
    this.settings = settings;
}

HorizGauge[Symbol.species] = HorizGauge;

/**
 * Draw the Horiz Gauge inside of the provided <code>settings.svg</code> DOM tree element.
 */
HorizGauge.prototype.draw = function () {
    validateSettings(this.settings);
    this.remove();
    drawGauge(this.settings);
}

/**
 * Clear the gauge from the provided <code>settings.svg</code> DOM tree element
 */
HorizGauge.prototype.remove = function () {
    if (this.settings.svg) {
        let svg = this.settings.svg;
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }
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

