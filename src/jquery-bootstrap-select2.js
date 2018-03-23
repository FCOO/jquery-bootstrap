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
                data: []
            });

        //Convert placeholder (if any)
        if (options.placeholder){
            var phText = $.extend(true, {}, options.placeholder);
            if (phText.text)
                phText = phText.text;
            options.placeholder = $.extend(options.placeholder, {
                id   : -1,
                _text: phText,
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
            dataOptions._text = $.extend(true, {}, itemOptions.text);
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
//       var $result =  $('<div class="input-group"></div>'); //TODO
        var $result =  $('<div class="form-control-with-label"></div>'); //TODO
        var $select = $('<select/>');
        $result.append( $select );

        options.dropdownParent = $result;

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
        select2.$dropdown.addClass( sizeClass );

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

        //Set selected id or placeholder
        $select
            .val(selectedIdExists ? options.selectedId : -1)
            .trigger('change');

        //Call onChange (if it and selectedId exists
        if (selectedIdExists && options.onChange)
            options.onChange( options.selectedId, true );

/*
var test = $('<div class="input-group"/>');
test.append(
    $result._wrapLabel({
        label: {
            _icon: 'fa-home',
            text: {da:'DA label', en:'EN label'}
        },
        placeholder: {da:'DA placeholder', en:'EN placeholder'}
    })
);
return test;
*/
        return $result;
    };
}(jQuery, this, document));