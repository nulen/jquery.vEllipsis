/*! jQuery vEllipsis - v0.3.1 - 2017-10-25
 * https://github.com/nulen/jquery.vEllipsis
 * Copyright (c) 2017 Nulen; Licensed MIT */
(function ($) {
	$.fn.vEllipsis = function (options) {

		if (!window.vEllipsis) {
			window.vEllipsis = {};

			// default option
			window.vEllipsis.options = {
				'element': '.v-ellipsis',           // element identifier
				'lines': 1,                         // show that many lines
				'onlyFullWords': false,             // set to true to avoid cutting the text in the middle of a word
				'char': '...',                      // ellipsis
				'callback': function () {},         // callback function
				'responsive': false,                // responsive to window resize
				'tolerance': 5,                     // optimal tolerance (best value is 5 based on tests)
				'delay': 300,                       // delay after resize
				'elementEvent': 'change',           // event to reEllipsise
				'additionalEnding': false,          // additional link after char (from data-link on element)
				'expandLink': false,                // expand link after char and additional link (from data-expandlink on element)
				'collapseLink': false,              // collapse link after char and additional link (from data-collapselink on element)
				'animationTime': '0',               // time for animations
				'linesClass': 'v-ellipsis-lines'    // class for changing number of lines
			};

			$(document).on('vEllipsisCreate', function () {
				runOnElements();
			});
		} else {
			window.vEllipsis.options = $.extend(window.vEllipsis.options, options);
			$(document).trigger('vEllipsisCreate');
			return;
		}

		var resizeTimer,
			scrollTimer,
			docViewTop = $(window).scrollTop(),
			docViewBottom = docViewTop + $(window).height(),
			options;

		window.vEllipsis.options = options = $.extend(window.vEllipsis.options, options);
		if (options.tolerance < 1) options.tolerance = 1;

		function isScrolledIntoView($elem) {
			var elemTop = $elem.offset().top;
			var elemBottom = elemTop + $elem.height();

			return !(elemTop > docViewBottom || elemBottom < docViewTop);
		}

		function doEllipsis($elem, opts) {
			if (opts.expandLink && $elem.data('expanded') === true)
				return;

			if ($elem.is(':visible')) {
				var text;

				if ($elem.data('lastHeight')) {
					if ($elem.data('lastHeight') === $elem.height() && $elem.data('lastWidth') === $elem.width()
						&& ($elem.data('lastText') === $elem.text() || $elem.data('lastHTML') === $elem.html())) {
						return;
					}
				}

				if ($elem.data('originalText')) {
					text = $elem.data('originalText');
					$elem.text(text);
				} else {
					text = $elem.text();
					$elem.data('originalText', text);
					$elem.data('originalHTML', $elem.html());
				}

				var classList = $elem.attr('class').split(/\s+/);
				var matchResult;
				var lines = opts.lines;
				var regEx = new RegExp("^" + opts.linesClass + "-(\\d+)$");

				$.each(classList, function (index, item) {
					matchResult = item.match(regEx);
					if (matchResult !== null)
						lines = Number(matchResult[1]);
				});

				if (opts.additionalEnding && $elem.data('link')) {
					var link = $elem.data('link');
				}
				if (opts.expandLink && $elem.data('expandlink')) {
					var expandlink = $elem.data('expandlink');
				}

				if (lines < 1) {
					text = '';
					$elem.text('');
				} else {
					var origText = text;
					var origLength = origText.length;
					var origHeight = $elem.height();

					// get height
					$elem.text('a');
					var lineHeight = parseFloat($elem.css('lineHeight'), 10);
					var rowHeight = $elem.height();
					var gapHeight = lineHeight > rowHeight ? (lineHeight - rowHeight) : 0;
					var targetHeight = gapHeight * (lines - 1) + rowHeight * lines;

					if (origHeight <= targetHeight) {
						$elem.text(text);

						$elem.data('lastText', text)
						$elem.data('lastHeight', $elem.height());
						$elem.data('lastWidth', $elem.width());

						return;
					}

					// raw approximation of final length
					var approxTargetRatio = (targetHeight + rowHeight) / (origHeight - (rowHeight + gapHeight));
					if (approxTargetRatio > 1) approxTargetRatio = 1;
					var approxTargetLength = Math.ceil(approxTargetRatio * origLength);

					text = text.slice(0, approxTargetLength);

					var character = opts.char;
					if (link) {
						$elem.html(link);
						character += ' ' + $elem.text();
					}
					if (expandlink) {
						$elem.html(expandlink);
						character += ' ' + $elem.text();
					}
					var start = lines === 1 ? 0 : Math.ceil(approxTargetLength / 2), length = 0;
					var end = approxTargetLength - 1;

					while (start + opts.tolerance - 1 < end) { // binary search for max length
						length = Math.ceil((start + end) / 2);

						$elem.text(text.slice(0, length) + character);

						if ($elem.height() <= targetHeight) {
							start = length;
						} else {
							end = length - opts.tolerance;
						}
					}

					text = text.slice(0, start);

					if (opts.onlyFullWords) {
						text = text.replace(/\s([^\s.]+)$/, ''); // remove fragment of the last word together
					}

					text = text.replace(/([:.,\s]+$)/g, ''); // cutting any left spaces, commas or dots at the end of text

					text += opts.char;
				}

				if (opts.animationTime != 0 && $elem.data('collapsing')) {
					var targetOuterHeight = $elem.outerHeight();
					$elem.html($elem.data('originalHTML')).css('height', $elem.outerHeight()).animate({
						height: targetOuterHeight
					}, parseInt(opts.animationTime), function () {
						$elem.css('height', '');
						fillElement();
					});
				} else {
					fillElement();
				}

				function fillElement() {
					$elem.text(text);

					if (link) {
						$elem.append(' ', link);
					}

					if (expandlink) {
						var expandElement = $(document.createElement('a')).append(expandlink);
						expandElement.on('click', function () {
							expandSection($elem);
						});
						$elem.append(' ', expandElement);
					}
				}

				$elem.data('lastText', text);
				$elem.data('lastHTML', $elem.html());
				$elem.data('lastHeight', $elem.height());
				$elem.data('lastWidth', $elem.width());

				opts.callback.call($elem[0]);
			}
		}

		function expandSection($elem) {
			if (options.animationTime != 0) {
				var originalOuterHeight = $elem.outerHeight();
			}

			$elem.html($elem.data('originalHTML'));

			if (options.animationTime != 0) {
				var targetOuterHeight = $elem.outerHeight();

				$elem.css('height', originalOuterHeight).animate({
					height: targetOuterHeight
				}, parseInt(options.animationTime), function () {
					$elem.css('height', '');
				});
			}

			if (options.expandLink && $elem.data('collapselink')) {
				var collapselink = $elem.data('collapselink'),
					collapseElement = $(document.createElement('a')).append(collapselink);

				collapseElement.on('click', function () {
					collapseSection($elem);
				});
				$elem.append(' ', collapseElement);
				$elem.data('expanded', true);
			}
		}

		function collapseSection($elem) {
			$elem.removeData('expanded').data('collapsing', true);
			doEllipsis($elem, options);
			$elem.removeData('collapsing');
		}

		function runOnElements(preventSearch) {
			docViewTop = $(window).scrollTop();
			docViewBottom = docViewTop + $(window).height();

			$(options.element).each(function () {
				var $elem = $(this);

				if (isScrolledIntoView($elem))
					doEllipsis($elem, options);
			});

		}

		function onResize() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () {
				runOnElements();
			}, options.delay);
		}

		if (options.responsive) {
			$(window).resize(function () {
				onResize();
			});
		}

		// Lazy ellipsis
		$(window).on('scroll', function () {
			clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function () {
				runOnElements();
			}, 100);
		});

		$(document).on(options.elementEvent, options.element, function () {
			var $elem = $(this);

			$elem.data('originalText', $elem.text());
			$elem.data('originalHTML', $elem.html());
			doEllipsis($elem, options);
		});

		runOnElements();

		return this;
	};
})(jQuery);
