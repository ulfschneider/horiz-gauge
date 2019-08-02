'use babel';

const d3 = require('d3');
const Base64 = require('js-base64').Base64;
const _ = require('underscore');
const DIVIDER_STROKE_WIDTH = 1;

function equalsIgnoreCase(a, b) {
    if (a && b) {
        return a.toLowerCase() == b.toLowerCase();
    } else {
        return false;
    }
}

function determineMarkerPosition(marker) {
    if (marker && equalsIgnoreCase('bottom', marker.position)) {
        return 'bottom';
    }
    return 'top';
}

function determineMarkerTextAnchor(marker) {
    if (marker && equalsIgnoreCase('start', marker.textAnchor)) {
        return 'start';
    } else if (marker && equalsIgnoreCase('end', marker.textAnchor)) {
        return 'end';
    }
    return 'middle';
}

function determineMarkerDistance(settings, marker) {
    if (!marker.distance) {
        return settings.fontSize / 2;
    }
    return marker.distance;
};

function determineLabelTextAnchor(label) {
    if (label && equalsIgnoreCase('middle', label.textAnchor)) {
        return 'middle';
    } else if (label && equalsIgnoreCase('end', label.textAnchor)) {
        return 'end';
    }
    return 'start';
}


function validateSettings(settings) {

    if (!settings) {
        throw "No settings";
    }

    if (!settings.svg && settings.id) {
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
    settings.borderWidth = _.isNumber(settings.borderWidth) ? settings.borderWidth : 0;

    settings.fractionColor = settings.fractionColor ? settings.fractionColor : '#222';
    settings.fractionExceedColor = settings.fractionExceedColor ? settings.fractionExceedColor : 'red';
    settings.fractionLabelColor = settings.fractionLabelColor ? settings.fractionLabelColor : 'white';
    settings.fractionLabel = settings.fractionLabel ? settings.fractionLabel : '';

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
    if (_.isUndefined(settings.leftLabel) || _.isEmpty(settings.leftLabel)) {
        settings.leftLabel = {
            label: '',
            color: '',
            textAnchor: determineLabelTextAnchor()
        }
    } else {
        settings.leftLabel.label = settings.leftLabel.label ? settings.leftLabel.label : '';
        settings.leftLabel.color = settings.leftLabel.color ? settings.leftLabel.color : settings.fractionColor;
        settings.leftLabel.textAnchor = settings.leftLabel.textAnchor ? settings.leftLabel.textAnchor : determineLabelTextAnchor();
    }

    if (_.isUndefined(settings.rightLabel) || _.isEmpty(settings.rightLabel)) {
        settings.rightLabel = {
            label: '',
            color: '',
            textAnchor: determineLabelTextAnchor()
        }
    } else {
        settings.rightLabel.label = settings.rightLabel.label ? settings.rightLabel.label : '';
        settings.rightLabel.color = settings.rightLabel.color ? settings.rightLabel.color : settings.fractionColor;
        settings.rightLabel.textAnchor = settings.rightLabel.textAnchor ? settings.rightLabel.textAnchor : determineLabelTextAnchor();
    }

    if (_.isUndefined(settings.markers)) {
        settings.markers = [];
    } else {
        for (m of settings.markers) {
            m.fraction = m.fraction ? m.fraction : 0;
            m.label = m.label ? m.label : '';
            m.color = m.color ? m.color : '';
            m.position = determineMarkerPosition(m);
            m.textAnchor = determineMarkerTextAnchor(m);
            m.distance = determineMarkerDistance(settings, m);
        }
    }

    if (_.isUndefined(settings.dividers)) {
        settings.dividers = [];
    } else {
        for (d of settings.dividers) {
            d.fraction = d.fraction ? d.fraction : 0;
            d.color = d.color ? d.color : settings.emptyColor;
        }
    }

    return settings;
}

function calcHorizFractionPosition(settings, fraction) {
    let f = _.isUndefined(fraction) ? settings.fraction : fraction;
    return Math.max(DIVIDER_STROKE_WIDTH / 2, Math.min(settings.progressWidth * f, settings.progressWidth - DIVIDER_STROKE_WIDTH / 2));
}

function formatPercentage(percentage) {
    let fixed = 0;
    if (percentage > 0 && percentage < 0.01) {
        fixed = 2;
    } else if (percentage < 1 && percentage > 0.99) {
        fixed = 2;
    }
    return (percentage ? percentage * 100 : 0).toFixed(fixed) + '%';
}

function determineFractionLabelText(settings) {
    if (settings.fractionLabel) {
        return settings.fractionLabel;
    } else {
        return formatPercentage(settings.fraction);
    }
}

function calcVertTextPosition(settings) {
    return settings.borderWidth + settings.progressHeight / 2 + settings.fontSize / 3;
}

function drawDividers(settings) {

    for (divider of settings.dividers) {
        let color = divider.color ? divider.color : settings.emptyColor;
        let fraction = divider.fraction;
        if (settings.fraction > 1.0) {
            fraction = fraction / settings.fraction;
        }
        settings.g.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, fraction))
            .attr('y1', settings.borderWidth)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, fraction))
            .attr('y2', settings.progressHeight + settings.borderWidth)
            .style('stroke-width', DIVIDER_STROKE_WIDTH)
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
    const determineLength = function (textAnchor, label) {
        let length = label.node().getComputedTextLength();
        if ('start' == textAnchor || 'end' == textAnchor) {
            return length;
        } else {
            return length / 2;
        }
    };

    for (marker of settings.markers) {
        let color = marker.color ? marker.color : settings.fractionColor;
        let fraction = marker.fraction;
        if (settings.fraction > 1.0) {
            fraction = fraction / settings.fraction;
        }

        settings.g.append('line')
            .attr('x1', settings.borderWidth + calcHorizFractionPosition(settings, fraction))
            .attr('y1', marker.position == 'bottom' ? settings.progressHeight + settings.borderWidth * 2 : 0)
            .attr('x2', settings.borderWidth + calcHorizFractionPosition(settings, fraction))
            .attr('y2', marker.position == 'bottom' ? settings.progressHeight + settings.borderWidth * 2 + marker.distance : -marker.distance)
            .style('stroke-width', DIVIDER_STROKE_WIDTH)
            .style('stroke', color);

        if (marker.label) {
            let label = settings.g.append('text')
                .text(marker.label)
                .attr('x', settings.borderWidth + calcHorizFractionPosition(settings, fraction))
                .attr('y', marker.position == 'bottom' ? settings.progressHeight + settings.borderWidth * 2 + settings.fontSize + marker.distance : -(marker.distance + settings.fontSize / 3))
                .attr('text-anchor', marker.textAnchor)
                .attr('fill', color)
                .attr('font-family', settings.fontFamily)
                .attr('font-size', settings.fontSize);

            let fractionPos = calcHorizFractionPosition(settings, fraction);

            if (fractionPos + determineLength(marker.textAnchor, label) > settings.progressWidth) {
                label.attr('x', settings.borderWidth + settings.progressWidth)
                    .attr('text-anchor', 'end');
            }
            if (fractionPos - determineLength(marker.textAnchor, label) < 0) {
                label.attr('x', settings.borderWidth)
                    .attr('text-anchor', 'start');
            }
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
    if (settings.leftLabel.label) {
        let leftLabel = settings.g.append('text')
            .text(settings.leftLabel.label)
            .attr('x', -settings.margin.left)
            .attr('y', calcVertTextPosition(settings))
            .attr('text-anchor', settings.leftLabel.textAnchor)
            .attr('fill', settings.leftLabel.color)
            .attr('font-family', settings.fontFamily)
            .attr('font-size', settings.fontSize);
        if (settings.leftLabel.textAnchor == 'middle') {
            leftLabel.attr('x', -settings.margin.left / 2);
        } else if (settings.leftLabel.textAnchor == 'end') {
            leftLabel.attr('x', - settings.fontSize / 2);
        }
    }

    //right label
    if (settings.rightLabel.label) {
        let rightLabel = settings.g.append('text')
            .text(settings.rightLabel.label)
            .attr('x', settings.progressWidth + settings.borderWidth * 2 + settings.fontSize / 2)
            .attr('y', calcVertTextPosition(settings))
            .attr('text-anchor', settings.rightLabel.textAnchor)
            .attr('fill', settings.rightLabel.color)
            .attr('font-family', settings.fontFamily)
            .attr('font-size', settings.fontSize);
        if (settings.rightLabel.textAnchor == 'middle') {
            rightLabel.attr('x', settings.progressWidth + settings.borderWidth * 2 + settings.margin.right / 2);
        } else if (settings.rightLabel.textAnchor == 'end') {
            rightLabel.attr('x', settings.progressWidth + settings.borderWidth * 2 + settings.margin.right - settings.fontSize / 2);
        }
    }

    drawMarkers(settings);
}

/**
Install in your Node project with 
 * <pre>
 * npm i horiz-gauge
 * </pre>
 * 
 * and use it inside your code via 
 * 
 * <pre>
 * const gauge = require('horiz-gauge');
 * </pre>
 * 
 * or, alternatively 
 * 
 * <pre>
 * import gauge from 'horize-gauge';
 * </pre>
 * 
 * Create the new gauge objects via
 * 
 * <pre>
 * let diagram = gauge(settings);
 * </pre> 
 * Play with the settings of the horiz-gauge by visiting http://htmlpreview.github.io/?https://cors.io/?https://github.com/ulfschneider/horiz-gauge/blob/master/horiz-gauge-playground.html
 * 
 * @constructor
 * @param {Object} settings - The configuration object for the gauge. 
 * All data for the gauge is provided with this object. 
* @param {Object} settings.svg - The DOM tree element, wich must be an svg tag.
 * The gauge will be attached to this DOM tree element. Example:
 * <pre>settings.svg = document.getElementById('gauge');</pre>
 * <code>'gauge'</code> is the id of a svg tag.
 * @param {String} [settings.id] - The id of a domtree svg element, to which the gauge will be bound to. 
 * The id will only be used in case settings.svg is not provided.
 * @param {Number} [settings.fraction] - Progress indication for the gauge. A value of 0 is indicating no progress, 1.0 is indicating completion. Default is <code>0.0</code>
 * @param {String} [settings.fractionLabel] - A label to show for the progress fraction. Default is <code>''</code>.
 * @param {String} [settings.fractionColor] - The color for the fraction indication. Default is <code>'#222'</code>
 * @param {String} [settings.fractionExceedColor] - The color to use in case fraction > 1.0.
 * @param {String} [settings.emptyColor] - Color for the non-progress area of the gauge. Default is <code>borderColor</code>
 * @param {Number} [settings.progressWidth] - Width in pixels for the progress gauge without borders and margins. Default is <code>200</code>.
 * @param {Number} [settings.progressHeight] - Height in pixels for the progress gauge without borders and margins. Default is <code>fontSize + 2</code>.
 * @param {String} [settings.borderColor] - Color of the border of the progress gauge. Default is <code>'#ccc'</code>
 * @param {Number} [settings.borderWidth] - Width in pixels for the border of the progress gauge. Default is <code>0</code>
 * @param {Number} [settings.fontSize] - Size in pixels for all labels. Default is <code>16</code>
 * @param {String} [settings.fontFamily] - The font to use for all labels. Default is <code>sans-serif</code>.
 * @param {{top: Number, right: Number, bottom: Number, right: Number}} [settings.margin] - The margin for the gauge. Markers and labels are drawn inside of the margin.
 * Default values are:
 * <pre>settings.margin = {
 * top: 0,
 * right: 0,
 * bottom: 0,
 * left: 0 }
 * </pre>
 * @param {{label: String, color: String, textAnchor: String}} [settings.leftLabel] - A label to put to the left of the progress gauge. 
 * Must fit into the left margin. Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>. 
 * Default values are:
 * <pre>settings.leftLabel = {
 *  label: '',
 *  color: '#222',
 *  textAnchor: 'start'
 * }
 * </pre>
 * @param {{label: String, color: String, textAnchor: String}} [settings.rightLabel] - A label to put to the right of the progress gauge. 
 * Must fit into the right margin. Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>. 
 * Default values are:
 * <pre>settings.rightLabel = {
 *  label: '',
 *  color: '#222',
 *  textAnchor: 'start'
 * }
 * </pre> 
 * @param {{fraction: Number, label: String, color: String, position: String, distance: Number, textAnchor: String}[]} [settings.markers] - Highlight fractions outside of the gauge.
 * Each marker is an object with a fraction for the marker and some optional settings. A marker must fit into the margins of the gauge.
 * Allowed values for <code>position</code> are <code>'top', 'bottom'</code>
 * Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>
 * Example:
 * <pre>settings.markers = [
 * { fraction: 0.0, label: 'G1', distance: 20 },
 * { fraction: 0.2, label: 'G2' },
 * { fraction: 0.8, label: 'G3', color: 'lightgray', position: 'bottom', textAnchor: 'start'}];</pre>
 * @param {{fraction: Number, color: String}}[] [settings.dividers] - Highlight fractions inside of the gauge.
 * Each divider is an object with a fraction and an optional color.
 * The default for <code>color</code> is <code>emptyColor</code>.
 * Example:
 * <pre>settings.markers = [
 * { fraction: 0.1 },
 * { fraction: 0.2, color: 'green' },
 * { fraction: 0.8, color: 'red'}];</pre>
 */
function HorizGauge(settings) {
    this.settings = settings;
}

HorizGauge[Symbol.species] = HorizGauge;

/**
 * Draw the gauge.
 * @param {Object} [settings] - The configuration object for the gauge. Optional.
 * If provided, will overwrite the settings object already given to the constructor.
 */
HorizGauge.prototype.draw = function (settings) {
    if (settings) {
        this.settings = settings;
    }
    drawGauge(this.settings);
}

/**
 * Clear the gauge.
 */
HorizGauge.prototype.remove = function () {
    removeGauge(this.settings);
}

/**
 * Draw the gauge and return the result as a string which can be assigned to the SRC attribute of an HTML IMG tag.
 * @returns {string}
 */
HorizGauge.prototype.imageSource = function () {
    this.draw();
    let html = this.settings.svg.outerHTML;
    return 'data:image/svg+xml;base64,' + Base64.encode(html);
}

/**
 * Draw the gauge and return the result as a SVG tag string.
 * @returns {string}
 */
HorizGauge.prototype.svgSource = function () {
    this.draw();
    return this.settings.svg.outerHTML;
}

module.exports = function (settings) {
    return new HorizGauge(settings);
}

