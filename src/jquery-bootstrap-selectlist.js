/****************************************************************************
	jquery-bootstrap-selectlist.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    bsSelectList( options ) - create a Bootstrap-list with selection

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    var selectlistId = 0;

    $.fn._selectlist_onMouseenter = function(/*event*/){
        this
            .addClass('highlighted')
            .siblings('.highlighted').removeClass('highlighted');
    };
    $.fn._selectlist_onMouseleave = function(/*event*/){
        this.removeClass('highlighted');
    };
    $.fn._selectlist_onMouseleaveList = function(/*event*/){
        this.find('.highlighted').removeClass('highlighted');
        this.find('.active').addClass('highlighted');
    };

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
                ._bsAddHtml( itemOptions/*, true */)
                .on('mouseenter', $.proxy($item._selectlist_onMouseenter, $item) )
                .on('mouseleave', $.proxy($item._selectlist_onMouseleave, $item) );

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result
            .on('mouseleave', $.proxy($result._selectlist_onMouseleaveList, $result) )
            .data('selectlist_radiogroup', radioGroup)
            .find('.active').addClass('highlighted');
        return $result;
    };

}(jQuery, this, document));