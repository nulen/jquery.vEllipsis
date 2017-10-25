jquery.vEllipsis
================
jQuery ellipsis plugin
----------------------
Based on: https://github.com/STAR-ZERO/jquery-ellipsis plugin

Pros:
- handles events
- handles screen resize
- no additional wrappers or styles needed
- number of lines to show can be set using class (e.g. 'v-ellipsis-lines-4')
- additional ending html element can be added individually for each element thorugh data property
- lazy ellipsis - process only fields that are visible

Configuration:
--------------
Simply add:

	<script src="https://raw.githubusercontent.com/nulen/jquery.vEllipsis/master/jquery.vEllipsis.js"></script>
	<script type="text/javascript">
		$( document ).ready(function() {
			$().vEllipsis();
		});
	</script>
	
to your page for default settings and add class 'v-ellipsis' to your text container (element can't have fixed height);

You can also extend them by adding configuration (below configuration is the default one), e.g.:

	$().vEllipsis({
		'element': '.v-ellipsis',		// element identifier
		'lines' : 1				// show that many lines
		'onlyFullWords': false			// set to true to avoid cutting the text in the middle of a word
		'char' : '...'				// ellipsis
		'callback': function() {}		// callback function
		'responsive': false			// responsive to window resize
		'tolerance': 5				// optimal tolerance (best value is 5 based on tests)
		'delay': 300				// delay after resize
		'elementEvent': 'change'		// event to reEllipsise
		'additionalEnding': false,		// additional link after char (from data-link on element)
		'expandLink': false,			// expand link after char and additional link (from data-expandlink on element)
		'collapseLink': false,			// collapse link after char and additional link (from data-collapselink on element)
		'animationTime': '0',			// time for animations
		'linesClass': 'v-ellipsis-lines'	// class for changing number of lines
	});

Adding additional class with a name specified in 'linesClass' setting, e.g. 'v-ellipsis-lines-4', changes target lines for this element to 4. You can put any number you want.
