function HorizGauge(config) {

    var isUndefined = function (thing) {
        return typeof thing == 'undefined';
    }

    var isNull = function (thing) {
        return thing == null;
    }

    var isTruthy = function (thing) {
        return !isFalsy(thing);
    }

    var isEmpty = function (thing) {
        for (var key in thing) {
            if (thing.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    var isFalsy = function (thing) {
        if (isUndefined(thing)) {
            return true;
        } else if (isNull(thing)) {
            return true;
        } else {
            return !thing;
        }
    }

    var isNumber = function (thing) {
        return !isString(thing) && !isNaN(thing) && isFinite(thing);
    }

    var isString = function (thing) {
        return (typeof thing == 'string' || thing instanceof String)
    }

    var deepCopy = function (thing) {
        return JSON.parse(JSON.stringify(thing));
    }

    var calcHorizFractionPosition = function (fraction) {
        return Math.max(0, Math.min(config.progressWidth * fraction, config.progressWidth));
    }

    var adjustFractionTextPosition = function (fractionLabel) {
        var length = fractionLabel.node()
            .getComputedTextLength();
        var fractionPos = calcHorizFractionPosition(config.fraction);
        if (fractionPos + config.textSize / 4 + length > config.progressWidth) {
            fractionLabel.attr('x', config.borderWidth + fractionPos - length - config.textSize / 4)
                .attr('fill', config.fractionLabelColor);
        } else {
            fractionLabel.attr('x', fractionPos + config.borderWidth + config.textSize / 4)
                .attr('fill', config.fractionColor);
        }
    }

    var determineFractionLabelText = function () {
        if (config.label.fraction) {
            return config.label.fraction;
        } else {
            return Math.round(config.fraction * 100) + '%';
        }
    }

    var calcVertTextPosition = function () {
        return config.borderWidth + config.progressHeight / 2 + config.textSize / 3;
    }

    var drawMarker = function (marker) {

        var color = marker.color ? marker.color : config.fractionColor;

        svg.append('line')
            .attr('x1', config.borderWidth + calcHorizFractionPosition(marker.fraction, config))
            .attr('y1', marker.position == 'BOTTOM' ? config.progressHeight + config.borderWidth * 2 : 0)
            .attr('x2', config.borderWidth + calcHorizFractionPosition(marker.fraction, config))
            .attr('y2', marker.position == 'BOTTOM' ? config.progressHeight + config.borderWidth * 2 + config.textSize : -config.textSize)
            .style('stroke-width', 1)
            .style('stroke', color);

        if (marker.label) {
            svg.append('text')
                .text(marker.label)
                .attr('x', config.borderWidth + calcHorizFractionPosition(marker.fraction, config))
                .attr('y', marker.position == 'BOTTOM' ? config.progressHeight + config.borderWidth * 2 + config.textSize * 2 : -(config.textSize + config.textSize / 3))
                .attr('text-anchor', 'middle')
                .attr('fill', color)
                .attr('font-family', 'sans-serif')
                .attr('font-size', config.textSize);
        }
    }

    var drawDivider = function (divider) {
        var color = divider.color ? divider.color : 'white';

        svg.append('line')
            .attr('x1', config.borderWidth + calcHorizFractionPosition(divider.fraction, config))
            .attr('y1', config.borderWidth)
            .attr('x2', config.borderWidth + calcHorizFractionPosition(divider.fraction, config))
            .attr('y2', config.progressHeight + config.borderWidth)
            .style('stroke-width', 1)
            .style('stroke', color);
    }

    var removeGauge = function () {
        var svg = d3.select('#' + config.id);
        if (svg) {
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }
        }
    }

    var prepareConfig = function (config) {
        var c = deepCopy(config);

        if (isUndefined(c.id) || isEmpty(c.id)) {
            throw 'id is undefined or empty';
        }

        c.fraction = c.fraction ? c.fraction : 0.0;
        c.progressWidth = c.progressWidth ? c.progressWidth : 300;
        c.progressHeight = c.progressHeight ? c.progressHeight : 26;
        c.borderColor = c.borderColor ? c.borderColor : 'lightgray';
        c.emptyColor = c.emptyColor ? c.emptyColor : 'lightgray';
        c.fractionColor = c.fractionColor ? c.fractionColor : 'black';
        c.fractionExceedColor = c.fractionExceedColor ? c.fractionExceedColor : 'red';
        c.fractionLabelColor = c.fractionLabelColor ? c.fractionLabelColor : 'white';
        c.labelColor = c.labelColor ? c.labelColor : 'black';
        c.borderWidth = isNumber(c.borderWidth) ? c.borderWidth : 0;
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

    var hasGauge = function () {
        return isTruthy(document.getElementById(config.id));
    }

    var drawGauge = function () {
        svg = d3.select('#' + config.id)
            .append('svg')
            .attr('id', config.id + 'svg')
            .attr('width', config.progressWidth + config.margin.left + config.margin.right + config.borderWidth * 2)
            .attr('height', config.progressHeight + config.margin.top + config.margin.bottom + config.borderWidth * 2)
            .append('g')
            .attr('transform', 'translate(' + (config.margin.left) + "," + (config.margin.top) + ')');

        //progress frame
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', config.progressWidth + config.borderWidth * 2)
            .attr('height', config.progressHeight + config.borderWidth * 2)
            .style('fill', config.borderColor);

        svg.append('rect')
            .attr('x', config.borderWidth)
            .attr('y', config.borderWidth)
            .attr('width', config.progressWidth)
            .attr('height', config.progressHeight)
            .style('fill', config.emptyColor);

        //progress bar
        var progressBar = svg.append('rect')
            .attr('x', config.borderWidth)
            .attr('y', config.borderWidth)
            .attr('width', calcHorizFractionPosition(config.fraction, config))
            .attr('height', config.progressHeight)
            .style('fill', config.fraction > 1.0 ? config.fractionExceedColor : config.fractionColor);

        //progress bar dividers
        for (divider of config.divider) {
            drawDivider(divider, config);
        }

        //progress label
        var fractionLabel = svg.append('text')
            .text(determineFractionLabelText(config))
            .attr('y', calcVertTextPosition(config))
            .attr('fill', 'none')
            .attr('font-family', 'sans-serif')
            .attr('font-size', config.textSize);
        adjustFractionTextPosition(fractionLabel, config);

        //left label
        if (config.label.left) {
            svg.append('text')
                .text(config.label.left)
                .attr('x', -config.textSize / 2)
                .attr('y', calcVertTextPosition(config))
                .attr('text-anchor', 'end')
                .attr('fill', config.labelColor)
                .attr('font-family', 'sans-serif')
                .attr('font-size', config.textSize);
        }

        //right label
        if (config.label.right) {
            svg.append('text')
                .text(config.label.right)
                .attr('x', config.progressWidth + config.borderWidth * 2 + config.textSize / 2)
                .attr('y', calcVertTextPosition(config))
                .attr('fill', config.labelColor)
                .attr('font-family', 'sans-serif')
                .attr('font-size', config.textSize);
        }

        for (marker of config.marker) {
            drawMarker(marker, config);
        }
    }

    //public interface

    this.draw = function () {

        if (!hasGauge()) {
            throw 'DOM element with id "' + config.id + '" could not be found';
        }

        removeGauge();
        drawGauge();
    }

    this.remove = function () {
        removeGauge();
    }

    this.configure = function (c) {
        config = prepareConfig(c);
        _this.draw();
    }

    this.toString = function () {
        return JSON.stringify(config, null, '  ');
    }

    //constructor
    var _this = this;
    var svg;
    this.configure(config);
    return this;
}

//////// Node Module Interface

try {
    if (module) {
        module.exports = {
            gauge: function (config) {
                this.gauge = new HorizGauge(config);
            },
            configure: function (config) {
                this.gauge.configure(config);
            },
            draw: function () {
                this.gauge.draw();
            },
            remove: function () {
                this.gauge.remove();
            }
        }
    }
} catch (e) {
    //in non-node environment module is not defined and therefore
    //we will not export anything
}