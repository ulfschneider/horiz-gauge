<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [HorizGauge][1]
    -   [Parameters][2]
    -   [draw][3]
        -   [Parameters][4]
    -   [remove][5]
    -   [imageSource][6]
    -   [svgSource][7]

## HorizGauge

<a href='https://travis-ci.com/ulfschneider/horiz-gauge'><img src='https://travis-ci.com/ulfschneider/horiz-gauge.svg?branch=master'/></a>
<a href='https://coveralls.io/github/ulfschneider/horiz-gauge?branch=master'><img src='https://coveralls.io/repos/github/ulfschneider/horiz-gauge/badge.svg?branch=master' /></a>
<a href='https://badge.fury.io/js/horiz-gauge'><img src='https://badge.fury.io/js/horiz-gauge.svg' /></a>

Draw a horizontal svg gauge.

<img src="https://github.com/ulfschneider/horiz-gauge/blob/master/horiz-gauge.png?raw=true"/>

Play with the settings of the horiz-gauge by visiting the [horiz-gauge playground][8].

Install in your Node project with 

<pre>
npm i horiz-gauge
</pre>

and use it inside your code via 

<pre>
const gauge = require('horiz-gauge');
</pre>

or, alternatively 

<pre>
import gauge from 'horize-gauge';
</pre>

Create the new gauge objects via

<pre>
let diagram = gauge(settings);
</pre>

### Parameters

-   `settings` **[Object][9]** The configuration object for the gauge. 
    All data for the gauge is provided with this object.
    -   `settings.svg` **[Object][9]** The DOM tree element, wich must be an svg tag.
        The gauge will be attached to this DOM tree element. Example:<pre>settings.svg = document.getElementById('gauge');</pre><code>'gauge'</code> is the id of a svg tag.
    -   `settings.id` **[String][10]?** The id of a domtree svg element, to which the gauge will be bound to. 
        The id will only be used in case settings.svg is not provided.
    -   `settings.fraction` **[Number][11]?** Progress indication for the gauge. A value of 0 is indicating no progress, 1.0 is indicating completion. Default is <code>0.0</code>
    -   `settings.fractionLabel` **[String][10]?** A label to show for the progress fraction. Default is <code>''</code>.
    -   `settings.fractionColor` **[String][10]?** The color for the fraction indication. Default is <code>'#222'</code>
    -   `settings.fractionExceedColor` **[String][10]?** The color to use in case fraction > 1.0.
    -   `settings.emptyColor` **[String][10]?** Color for the non-progress area of the gauge. Default is <code>borderColor</code>
    -   `settings.emptyPattern` **[Boolean][12]?** When true, the empty area will be a pattern made of <code>fractionColor</code> and <code>emptyColor</code>
    -   `settings.progressWidth` **[Number][11]?** Width in pixels for the progress gauge without borders and margins. Default is <code>200</code>.
    -   `settings.progressHeight` **[Number][11]?** Height in pixels for the progress gauge without borders and margins. Default is <code>fontSize + 2</code>.
    -   `settings.borderColor` **[String][10]?** Color of the border of the progress gauge. Default is <code>'#ccc'</code>
    -   `settings.borderWidth` **[Number][11]?** Width in pixels for the border of the progress gauge. Default is <code>0</code>
    -   `settings.fontSize` **[Number][11]?** Size in pixels for all labels. Default is <code>16</code>
    -   `settings.fontFamily` **[String][10]?** The font to use for all labels. Default is <code>sans-serif</code>.
    -   `settings.margin` **{top: [Number][11], right: [Number][11], bottom: [Number][11], left: [Number][11]}?** The margin for the gauge. Markers and labels are drawn inside of the margin.
        Default values are:<pre>settings.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0 }
        </pre>
    -   `settings.leftLabel` **{label: [String][10], color: [String][10], textAnchor: [String][10]}?** A label to put to the left of the progress gauge. 
        Must fit into the left margin. Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>. 
        Default values are:<pre>settings.leftLabel = {
         label: '',
         color: '#222',
         textAnchor: 'start'
        }
        </pre>
    -   `settings.rightLabel` **{label: [String][10], color: [String][10], textAnchor: [String][10]}?** A label to put to the right of the progress gauge. 
        Must fit into the right margin. Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>. 
        Default values are:<pre>settings.rightLabel = {
         label: '',
         color: '#222',
         textAnchor: 'start'
        }
        </pre>
    -   `settings.markers` **[Array][13]&lt;{fraction: [Number][11], label: [String][10], color: [String][10], position: [String][10], distance: [Number][11], textAnchor: [String][10]}>?** Highlight fractions outside of the gauge.
        Each marker is an object with a fraction for the marker and some optional settings. A marker must fit into the margins of the gauge.
        Allowed values for <code>position</code> are <code>'top', 'bottom'</code>
        Allowed values for <code>textAnchor</code> are <code>'start', 'middle', 'end'</code>
        Example:<pre>settings.markers = [
        { fraction: 0.0, label: 'G1', distance: 20 },
        { fraction: 0.2, label: 'G2' },
        { fraction: 0.8, label: 'G3', color: 'lightgray', position: 'bottom', textAnchor: 'start'}];</pre>
    -   `settings.dividers` **[Array][13]&lt;{fraction: [Number][11], color: [String][10]}>?** Highlight fractions inside of the gauge.
        Each divider is an object with a fraction and an optional color.
        The default for <code>color</code> is <code>emptyColor</code>.
        Example:<pre>settings.markers = [
        { fraction: 0.1 },
        { fraction: 0.2, color: 'green' },
        { fraction: 0.8, color: 'red'}];</pre>

### draw

Draw the gauge.

#### Parameters

-   `settings` **[Object][9]?** The configuration object for the gauge. Optional.
    If provided, will overwrite the settings object already given to the constructor.

### remove

Clear the gauge.

### imageSource

Draw the gauge and return the result as a string which can be assigned to the SRC attribute of an HTML IMG tag.

Returns **[string][10]** 

### svgSource

Draw the gauge and return the result as a SVG tag string.

Returns **[string][10]** 

[1]: #horizgauge

[2]: #parameters

[3]: #draw

[4]: #parameters-1

[5]: #remove

[6]: #imagesource

[7]: #svgsource

[8]: https://htmlpreview.github.io/?https://github.com/ulfschneider/horiz-gauge/blob/master/horiz-gauge-playground.html

[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[10]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[12]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[13]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
