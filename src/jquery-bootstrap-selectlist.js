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
                useTouchSize: true,
                createItemContent: null, //function( itemOptions ) return a $-element
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

        options.list = options.list || [];
        options.list.forEach( itemOptions => {
            const isItem = (itemOptions.id != undefined);
            let $item;

            if (isItem){
                if (options.createItemContent)
                    $item = options.createItemContent( itemOptions );
                else
                    $item = $('<a/>')
                        .addClass('dropdown-item')
                        .toggleClass( 'text-center',   !!options.center )
                        .toggleClass( 'text-truncate', !!options.truncate )
                        ._bsAddHtml( itemOptions, false, false, true );
            }
            else {
                if (options.createHeaderContent)
                    $item = options.createHeaderContent( itemOptions );
                else
                    $item = $('<div/>')
                        .addClass('dropdown-header')
                        .toggleClass( 'text-center',   !!options.center )
                        .toggleClass( 'text-truncate', !!options.truncate )
                        ._bsAddHtml( itemOptions, false, false, true );
            }

            $item.appendTo( $result );

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result.data('selectlist_radiogroup', radioGroup);

        return $result;
    };

}(jQuery, this, document));