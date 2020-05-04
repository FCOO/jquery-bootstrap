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
                baseClass   : 'selectList',
                class       : '',
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
                        className        : 'active highlighted',
                        allowZeroSelected: false
                    })
                );

        $result.data('radioGroup', radioGroup);

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $(isItem ? '<a/>' : '<div/>');
            $item
                .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )
                .addClass( options.center ? 'text-center' : '')
                .appendTo( $result )
                ._bsAddHtml( itemOptions, false, false, true );

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result.data('selectlist_radiogroup', radioGroup);

        return $result;
    };

}(jQuery, this, document));