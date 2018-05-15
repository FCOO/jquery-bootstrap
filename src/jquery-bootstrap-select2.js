/****************************************************************************
	jquery-bootstrap-select2.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsSelectbox based on select2

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    //Setting defaults for select2
    function formatSelectOption( options ) {
        options.text = options._text;
        var $result = $('<span/>')._bsAddHtml( options, true );
        options.text = '';
        return $result;
    }

    $.fn.select2.defaults.set( 'theme',                   'standard'         );
    $.fn.select2.defaults.set( 'templateResult',          formatSelectOption );
    $.fn.select2.defaults.set( 'templateSelection',       formatSelectOption );
    $.fn.select2.defaults.set( 'minimumResultsForSearch', Infinity           );
    $.fn.select2.defaults.set( 'width',                   "100%"             );
    $.fn.select2.defaults.set( 'closeOnSelect',           true               ); ////ONLY when testing: false

    //Override default Results.ensureHighlightVisible to use scrollbar
    function ensureHighlightVisible(){
        var $highlightedItem = this.getHighlightedResults();
        if ($highlightedItem.length)
            $highlightedItem.scrollIntoView();
    }


    var maxItemsVisibleInSelectbox = 4, //NB Must be equal with $max-items-visible-in-selectbox in _select2.scss
        selectboxId = 0;

    /**********************************************************
    bsSelectbox
    **********************************************************/
    $.bsSelectBox = $.bsSelectbox = function( options ){
        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'select2-container',
                class       : '',
                useTouchSize: true,

                //Options for select2
                data: [],
            });

        //Convert placeholder (if any)
        if (options.placeholder){
            options.placeholder = $._bsAdjustIconAndText( options.placeholder );
            options.placeholder = $.extend(options.placeholder, {
                id   : -1,
                _text: options.placeholder.text,
                text : ''
            });
        }

        //Append items
        var currentData = options.data,
            selectedIdExists = false;

        //Convert options.items to select2-data
        $.each( options.items, function( index, itemOptions ){
            var dataOptions = $.extend(true, {}, itemOptions);

            //Save text as _text to prevent select2 to convert text to string
            dataOptions._text = itemOptions.text;
            dataOptions.text = '';

            if (itemOptions.id){
                currentData.push( dataOptions );
                if (itemOptions.id == options.selectedId)
                    selectedIdExists = true;
            }
            else {
                dataOptions.children = [];
                options.data.push( dataOptions );
                currentData = dataOptions.children;
            }
        });

        //Create result and select-element
        var $select =
                $('<select/>')
                    ._bsAddIdAndName( options ),
            $result =
                $('<div class="form-control-with-label"></div>')
                    .append( $select );

        //Seems to be working without: options.dropdownParent = $result;

        //Create select2
        $select.select2( options );
        var select2 = $select.data('select2');

        //Overwrite default ensureHighlightVisible
        select2.results.ensureHighlightVisible = ensureHighlightVisible;

        //Add size-class to both containers
        var sizeClass = $._bsGetSizeClass({
                baseClass   : 'select2-container',
                small       : options.small,
                useTouchSize: true
        });
        select2.$container.addClass( sizeClass );
        select2.$dropdown.addClass ( sizeClass );

        //Replace default arrow with Chevrolet-style
        var $arrow = $('<i/>').addClass('fa select2-selection__arrow');
        select2.$selection.find('.select2-selection__arrow')
            .after($arrow)
            .remove();

        //If there are more than maxItemsVisibleInSelectbox items: Create scrollbar and move highlighted item into view
        if (options.items.length > maxItemsVisibleInSelectbox){
            //Wrap select2.$results inside a scrollbar
            var $parent = select2.$results.parent();
            select2.$results.detach();
            $parent.addScrollbar().append(select2.$results);

            //Scroll highlighted item into view when moving with keyboard
            select2.$selection.on('keydown', $.proxy(ensureHighlightVisible, select2.results) );
        }

        //Create change/select-event-function
        if (options.onChange)
            $select.on('select2:select', function( event ){
                var data = event.params.data;
                options.onChange( data.id, data.selected );
            });


        var $label = $result._wrapLabel({ label: options.label });
        function setLabelAsPlaceholder( hasFocus, TEST ){
            var showLabelAsPlaceholder = TEST || (!hasFocus && !$select.find(':selected').length);
            $label.toggleClass('hide-float-label', showLabelAsPlaceholder);
            $result.toggleClass('show-label-as-placeholder', showLabelAsPlaceholder);
            select2.$container.toggleClass('select2-hide-placeholder', showLabelAsPlaceholder);
        }

        function onBlurOrFocus(){
            setLabelAsPlaceholder(
                select2.$container.hasClass('select2-container--open') ||
                select2.$container.hasClass('select2-container--focus')
            );
        }

        select2.on('focus', onBlurOrFocus);
        select2.on('blur', onBlurOrFocus);

        $select.on('change', function(){
            setLabelAsPlaceholder();
        });

        //Set selected id or placeholder
        $select
            .val(selectedIdExists ? options.selectedId : -1)
            .trigger('change.select2');


        //Call onChange (if it and selectedId exists
        if (selectedIdExists && options.onChange)
            options.onChange( options.selectedId, true );

        setLabelAsPlaceholder( false );

        return $label;
    };
}(jQuery, this, document));