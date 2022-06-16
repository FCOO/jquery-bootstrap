/****************************************************************************
	jquery-bootstrap-selectlist.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    bsSelectList( options ) - create a Bootstrap-list with selection

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var selectlistId = 0;

    $.bsSelectList = $.bsSelectlist = function( options ){
        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectlist'+ selectlistId++,
                baseClass   : 'select-list',
                class       : 'form-control dropdown-menu',
                useTouchSize: true
            });

        var $result =
                $('<div tabindex="0"/>')
                    ._bsAddIdAndName( options )
                    ._bsAddBaseClassAndSize( options ),
            radioGroup =
                $.radioGroup(
                    $.extend({}, options, {
                        radioGroupId     : options.id,
                        className        : 'active',
                        allowZeroSelected: false
                    })
                );

        $result.data('radioGroup', radioGroup);

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $(isItem ? '<a/>' : '<div/>')
                            .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )
                            .addClass( options.center ? 'text-center' : '')
                            ._bsAddHtml( itemOptions, false, false, true )
                            .appendTo( $result );

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result.data('selectlist_radiogroup', radioGroup);

        return $result;
    };

}(jQuery, this, document));