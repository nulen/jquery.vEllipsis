/*! jQuery vEllipsis - v0.2 - 2016-06-15
* https://github.com/nulen/jquery.vEllipsis
* Copyright (c) 2016 Nulen; Licensed MIT */
(function($) {
    $.fn.vEllipsis = function(options) {

        // default option
        var defaults = {
            'element': '.v-ellipsis',           // element identifier
            'lines' : 1,                        // show that many lines
            'onlyFullWords': false,             // set to true to avoid cutting the text in the middle of a word
            'char' : '...',                     // ellipsis
            'callback': function() {},          // callback function
            'responsive': false,                // responsive to window resize
            'tolerance': 5,                     // optimal tolerance
            'delay': 500,                       // delay after resize
            'elementEvent': 'change',           // event to reEllipsise
            'additionalEnding': false,          // additional link after char
            'linesClass': 'v-ellipsis-lines'    // class for changing number of lines
        };

        var resizeTimer;

        options = $.extend(defaults, options);
        if (options.tolerance < 1) options.tolerance = 1;

        function doEllipsis(el, opts) {
            var $this = $(el);
            var text;

            if ($this.data('lastHeight')) {
                if ($this.data('lastHeight') === $this.height() && $this.data('lastWidth') === $this.width()
                    && $this.data('lastText') === $this.text()) {
                    return;
                }
            }

            if ($this.data('originalText')) {
                text = $this.data('originalText');
                $this.text(text);
            } else {
                text = $this.text();
                $this.data('originalText', text);
            }

            var classList = $this.attr('class').split(/\s+/);
            var matchResult;
            var lines = opts.lines;
            var regEx = new RegExp("^" + opts.linesClass + "-(\\d+)$");
            $.each(classList, function(index, item) {
                matchResult = item.match(regEx);
                if (matchResult !== null)
                    lines = Number(matchResult[1]);
            });

            var origText = text;
            var origLength = origText.length;
            var origHeight = $this.height();

            // get height
            $this.text('a');
            var lineHeight = parseFloat($this.css('lineHeight'), 10);
            var rowHeight = $this.height();
            var gapHeight = lineHeight > rowHeight ? (lineHeight - rowHeight) : 0;
            var targetHeight = gapHeight * (lines - 1) + rowHeight * lines;

            if (origHeight <= targetHeight) {
                $this.text(text);

                $this.data('lastText', text)
                $this.data('lastHeight', $this.height());
                $this.data('lastWidth', $this.width());

                opts.callback.call(el);
                return;
            }

            // raw approximation of final length
            var approxTargetRatio = (targetHeight + rowHeight) / (origHeight - (rowHeight + gapHeight));
            if (approxTargetRatio > 1) approxTargetRatio = 1;
            var approxTargetLength = Math.ceil(approxTargetRatio * origLength);

            text = text.slice(0, approxTargetLength);

            var character = opts.char;
            if (opts.additionalEnding && $this.data('link')) {
                var link = $this.data('link');
                $this.html(link);
                character += ' ' + $this.text();
            }
            var start = lines === 1 ? 0 : Math.ceil(approxTargetLength/2), length = 0;
            var end = approxTargetLength-1;

            while (start + opts.tolerance - 1 < end) { // binary search for max length
                length = Math.ceil((start + end) / 2);

                $this.text(text.slice(0, length) + character);

                if ($this.height() <= targetHeight) {
                    start = length;
                } else {
                    end = length - opts.tolerance;
                }
            }

            text = text.slice(0, start);

            if (opts.onlyFullWords) {
                text = text.replace(/\s(\w+)$/, ''); // remove fragment of the last word together
            }

            text = text.replace(/([:.,\s]+$)/g, ''); // cutting any left spaces, commas or dots at the end of text

            text += opts.char;

            $this.text(text);
            
            if (opts.additionalEnding && $this.data('link')) {
                $this.append(' ' + link);
            }

            $this.data('lastText', text)
            $this.data('lastHeight', $this.height());
            $this.data('lastWidth', $this.width());

            opts.callback.call(el);
        }

        function runOnElements() {
            $(options.element).each(function(){
                doEllipsis(this, options);
            });
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                runOnElements();
            }, options.delay);
        }

        if (options.responsive) {
            $( window ).resize(function () {
                onResize();
            });
        }

        $(document).on(options.elementEvent, options.element, function() {
            doEllipsis(this, options);
        });

        runOnElements();

        return this;
    };
}) (jQuery);
