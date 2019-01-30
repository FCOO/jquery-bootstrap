/****************************************************************************
	jquery-bootstrap-select.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsSelectbox based on
    bootstrap-select https://developer.snapappointments.com/bootstrap-select/


****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    //Setting defaults for bootstrap-select
    $.fn.selectpicker.Constructor.BootstrapVersion = '4';

    $.fn.selectpicker.Constructor.DEFAULTS = $.extend( $.fn.selectpicker.Constructor.DEFAULTS, {

    styleBase         : 'btn',
    style             : 'btn-standard',
        size: 'auto',
        selectedTextFormat: 'values',

        title: null,

    noneSelectedText: '', //'Er det denne her?',

    width             : '100%', //false,
    container         : 'body', //false,
        hideDisabled: false,
        showSubtext: false,
        showIcon   : true,
        showContent: true,
        dropupAuto: true,
        header: false,
        liveSearch: false,
        liveSearchPlaceholder: null,
        liveSearchNormalize: false,
        liveSearchStyle: 'contains',
        actionsBox: false,
        showTick: true,
    iconBase: $.FONTAWESOME_PREFIX, //'glyphicon',
    tickIcon: 'fa-ok',              //'glyphicon-ok',
    });

    //Sets max visible items in list to four if the screen is 'small'
    if ( Math.min(window.screen.width, window.screen.height) < 420 )
        $.fn.selectpicker.Constructor.DEFAULTS.size = 4;

    var selectboxId = 0;

    /**********************************************************
    bsSelectbox
    **********************************************************/
    $.bsSelectBox = $.bsSelectbox = function( options ){

        //Add size-class to button-class
        var buttonSizeClass = $._bsGetSizeClass({
                baseClass   : 'btn',
                small       : options.small,
                useTouchSize: true
            }),
            dropdownMenuSizeClass = $._bsGetSizeClass({
                baseClass   : 'dropdown-menu',
                small       : options.small,
                useTouchSize: true
            });

        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'btn',
                class       : '',
                style       : 'btn-standard ' + buttonSizeClass,
                useTouchSize: true,
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
        var selectedIdFound = false,

        //Create result and select-element
            $select =
                $('<select/>')
                    ._bsAddIdAndName( options ),
            $result =
                $('<div class="form-control-with-label"></div>')
                    .append( $select );

        //Convert options.items to select-option
        var $currentParent = $select;
        $.each( options.items, function( index, itemOptions ){
            if (itemOptions.id){
                if (itemOptions.id == options.selectedId)
                    selectedIdFound = true;
                $('<option/>')
                    .text(itemOptions.id)
                    .prop('selected', itemOptions.id == options.selectedId)
                    .appendTo($currentParent);
            }
            else
                $currentParent = $('<optgroup/>').appendTo($select);
        });

        //Create selectpicker
        var selectpicker = $select.selectpicker(options).data('selectpicker').selectpicker;
        selectpicker.bsOptions = options;

        //Set size-class for dropdown-menu
        $select.parent().find('.dropdown-menu').addClass(dropdownMenuSizeClass);

        //Update the content of the items with bsOptions
        var itemIndex = 0;
        $.each( selectpicker.main.data, function(index, data ){
            if ((data.type == 'option') || (data.type == 'optgroup-label')){
                var $elem = $(selectpicker.main.elements[index]),
                    $child = $elem.children().first();

                $child.empty();
                $child._bsAddHtml(options.items[itemIndex]);
                $elem.data('bsOptions', options.items[itemIndex] );

                options.items[itemIndex].elementIndex = index;
                options.items[itemIndex].$element = $elem;

                itemIndex++;
            }
        });

        //Replace default arrow with Chevrolet-style
        $('<i/>')
            .addClass('fa chevrolet')
            .appendTo( $select.parent().find('.filter-option-inner') );

        //wrap inside a label
        var $label = $result._wrapLabel({ label: options.label });

        //** Add events **

        //setLabelAsPlaceholder: Update label position
        function setLabelAsPlaceholder( showLabelAsPlaceholder ){
            if (typeof showLabelAsPlaceholder != 'boolean')
                showLabelAsPlaceholder = !$select.selectpicker('val');
            $result.toggleClass('show-label-as-placeholder', showLabelAsPlaceholder);
        }

        //Set events to update content and call onChange
        $select.on('changed.bs.select', function (/*e, clickedIndex, isSelected, previousValue*/) {
            var selectedIndex = $select[0].selectedIndex;

            if (selectedIndex != -1){
                var elementIndex = selectpicker.main.map.newIndex[selectedIndex],
                    options = $(selectpicker.main.elements[elementIndex]).data('bsOptions');

                selectpicker.$inner = selectpicker.$inner || $select.parent().find('.filter-option-inner-inner');

                selectpicker.$inner.empty();
                selectpicker.$inner._bsAddHtml(options);

                if (selectpicker.bsOptions.onChange)
                    selectpicker.bsOptions.onChange( options.id, true );
            }
            setLabelAsPlaceholder();
        });

        $select.on('show.bs.select', function(){ setLabelAsPlaceholder(false); });
        $select.on('hide.bs.select', function(){ setLabelAsPlaceholder();      });


        //Set selected item (id any)
        $select.selectpicker('val', selectedIdFound ? options.selectedId : null);

        return $label;
    };



    $.fn._bsSelectBoxClose = function(){
        var selectpicker = $(this).data('selectpicker');
        if (selectpicker && selectpicker.$menu.hasClass('show')){
            $(this).selectpicker('toggle');
        }

    };


}(jQuery, this, document));