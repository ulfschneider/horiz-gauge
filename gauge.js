function isUndefined(thing) {
    return typeof thing == 'undefined';
}

function isNull(thing) {
    return thing == null;
}

function isTruthy(thing) {
    return !isFalsy(thing);
}

function isEmpty(thing) {
    for (var key in thing) {
        if (thing.hasOwnProperty(key))
            return false;
    }
    return true;
}

function isFalsy(thing) {
    if (isUndefined(thing)) {
        return true;
    } else if (isNull(thing)) {
        return true;
    } else {
        return !thing;
    }
}

function deepCopy(thing) {
    return JSON.parse(JSON.stringify(thing));
}


Gauge = (function() {
    var _this = this;

    var calcHorizFractionPosition = function(fraction, config) {
        return Math.max(0, Math.min((config.width - config.strokeWidth) * fraction, config.width - config.strokeWidth));
    }

    var adjustFractionTextPosition = function(fractionLabel, config) {
        var length = fractionLabel.node()
            .getComputedTextLength();
        if (calcHorizFractionPosition(config.fraction, config) + config.strokeWidth + length + 1 > config.width - config.strokeWidth) {
            fractionLabel.attr('x', calcHorizFractionPosition(config.fraction, config) - length - config.strokeWidth - 1)
                .attr('fill', config.fractionLabelColor);
        } else {
            fractionLabel.attr('x', calcHorizFractionPosition(config.fraction, config) + config.strokeWidth + 1)
                .attr('fill', config.fractionColor);
        }
    }

    var determineFractionLabelText = function(config) {
        if (config.label.fraction) {
            return config.label.fraction;
        } else {
            return Math.round(config.fraction * 100) + '%';
        }
    }

    var calcVertTextPosition = function(config) {
        return config.height + config.strokeWidth / 2 - Math.max(2, config.strokeWidth / 2) - (config.height - config.textSize) / 2;
    }

    var drawMarker = function(marker, config) {

        var color = marker.color ? marker.color : config.fractionColor;

        config.svg.append('line')
            .attr('x1', config.strokeWidth / 2 + calcHorizFractionPosition(marker.fraction, config))
            .attr('y1', marker.position == 'BOTTOM' ? config.height + config.strokeWidth / 2 : -config.strokeWidth / 2)
            .attr('x2', config.strokeWidth / 2 + calcHorizFractionPosition(marker.fraction, config))
            .attr('y2', marker.position == 'BOTTOM' ? config.height + +config.strokeWidth / 2 + config.textSize : -config.textSize - config.strokeWidth / 2)
            .style('stroke-width', 1)
            .style('stroke', color);

        if (marker.label) {
            config.svg.append('text')
                .text(marker.label)
                .attr('x', config.strokeWidth / 2 + calcHorizFractionPosition(marker.fraction, config))
                .attr('y', marker.position == 'BOTTOM' ? config.height + config.strokeWidth / 2 + 2 * config.textSize : -config.textSize - config.strokeWidth / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', color)
                .attr('font-family', 'sans-serif')
                .attr('font-size', config.textSize);
        }
    }

    var drawDivider = function(divider, config) {
        var color = divider.color ? divider.color : 'white';

        config.svg.append('line')
            .attr('x1', config.strokeWidth / 2 + calcHorizFractionPosition(divider.fraction, config))
            .attr('y1', config.strokeWidth / 2)
            .attr('x2', config.strokeWidth / 2 + calcHorizFractionPosition(divider.fraction, config))
            .attr('y2', config.height - config.strokeWidth / 2)
            .style('stroke-width', 1)
            .style('stroke', color);
    }

    var clearGauge = function(config) {
        d3.select('#' + config.id + 'svg')
            .remove();
    }

    var prepareConfig = function(config) {
        var c = deepCopy(config);

        if (isUndefined(c.id) || isEmpty(c.id)) {
            throw 'id is undefined or empty';
        }

        c.fraction = c.fraction ? c.fraction : 0.0;
        c.width = c.width ? c.width : 300;
        c.height = c.height ? c.height : 26;
        c.borderColor = c.borderColor ? c.borderColor : 'lightgray';
        c.emptyColor = c.emptyColor ? c.emptyColor : 'lightgray';
        c.fractionColor = c.fractionColor ? c.fractionColor : 'black';
        c.fractionExceedColor = c.fractionExceedColor ? c.fractionExceedColor : 'red';
        c.fractionLabelColor = c.fractionLabelColor ? c.fractionLabelColor : 'white';
        c.labelColor = c.labelColor ? c.labelColor : 'black';
        c.strokeWidth = c.strokeWidth ? c.strokeWidth : 4;
        c.textSize = c.textSize ? c.textSize : 16;
        if (isUndefined(c.margin) || isEmpty(c.margin)) {
            c.margin = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        } else {
            c.margin.left = c.margin.left ? c.margin.left : 0;
            c.margin.top = c.margin.top ? c.margin.top : 0;
            c.margin.right = c.margin.right ? c.margin.right : 0;
            c.margin.bottom = c.margin.bottom ? c.margin.bottom : 0;
        }
        if (isUndefined(c.label) || isEmpty(c.label)) {
            c.label = {
                fraction: '',
                left: '',
                right: ''
            }
        } else {
            c.label.fraction = c.label.fraction ? c.label.fraction : '';
            c.label.left = c.label.left ? c.label.left : '';
            c.label.right = c.label.right ? c.label.right : '';
        }

        if (isUndefined(c.marker)) {
            c.marker = [];
        } else {
            for (m of c.marker) {
                m.fraction = m.fraction ? m.fraction : 0;
                m.label = m.label ? m.label : '';
                m.color = m.color ? m.color : '';
                m.position = m.position ? m.position : '';
            }
        }

        if (isUndefined(c.divider)) {
            c.divider = [];
        } else {
            for (d of c.divider) {
                d.fraction = d.fraction ? d.fraction : 0;
                d.color = d.color ? d.color : '';
            }
        }

        return c;
    }

    var hasGauge = function(config) {
        return isTruthy(document.getElementById(config.id));
    }


    return {
        draw: function(config) {
            config = prepareConfig(config);

            if (!hasGauge(config)) {
                throw 'DOM element with id [' + config.id + '] could not be found';
            }

            clearGauge(config);

            config.svg = d3.select('#' + config.id)
                .append('svg')
                .attr('id', config.id + 'svg')
                .attr('width', config.width + config.margin.left + config.margin.right + config.strokeWidth)
                .attr('height', config.height + config.margin.top + config.margin.bottom + config.strokeWidth)
                .append('g')
                .attr('transform', 'translate(' + config.margin.left + "," + config.margin.top + ')');

            //progress frame
            config.svg.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', config.width)
                .attr('height', config.height)
                .style('stroke-width', config.strokeWidth)
                .style('stroke', config.borderColor)
                .style('fill', config.emptyColor);

            //progress bar
            config.svg.append('rect')
                .attr('x', config.strokeWidth / 2)
                .attr('y', config.strokeWidth / 2)
                .attr('width', calcHorizFractionPosition(config.fraction, config))
                .attr('height', config.height - config.strokeWidth)
                .style('fill', config.fraction > 1.0 ? config.fractionExceedColor : config.fractionColor);

            //progress bar dividers
            for (divider of config.divider) {
                drawDivider(divider, config);
            }

            //progress label
            var fractionLabel = config.svg.append('text')
                .text(determineFractionLabelText(config))
                .attr('y', calcVertTextPosition(config))
                .attr('fill', 'none')
                .attr('font-family', 'sans-serif')
                .attr('font-size', config.textSize);
            adjustFractionTextPosition(fractionLabel, config);

            //left label
            if (config.label.left) {
                config.svg.append('text')
                    .text(config.label.left)
                    .attr('x', -config.textSize / 2 - config.strokeWidth / 2)
                    .attr('y', calcVertTextPosition(config))
                    .attr('text-anchor', 'end')
                    .attr('fill', config.labelColor)
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', config.textSize);
            }

            //right label
            if (config.label.right) {
                config.svg.append('text')
                    .text(config.label.right)
                    .attr('x', config.width + config.strokeWidth / 2 + config.textSize / 2)
                    .attr('y', calcVertTextPosition(config))
                    .attr('fill', config.labelColor)
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', config.textSize);
            }

            for (marker of config.marker) {
                drawMarker(marker, config);
            }
        }
    }

}());