jquery.vEllipsis
================

jQuery Ellipsis plugin
----------------------

- handles events
- handles screenResize

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

You can also extend them by adding configuration, e.g.:

    $().vEllipsis({
        lines: 2,
        onlyFullWords: true,
        responsive: true
    });

Adding another class 'v-ellipsis-lines-4' changes target lines for this element to 4. You can put any number you want.
