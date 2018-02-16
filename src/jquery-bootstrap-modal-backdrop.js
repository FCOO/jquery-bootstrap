/****************************************************************************
	jquery-bootstrap-modal-backdrop.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    Global methods to provide backdrop for modal windows and noty

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    var zindexModalBackdrop = 1040, //MUST be equal to $zindex-modal-backdrop in bootstrap/scss/_variables.scss
        zindexAllwaysOnTop  = 9999,
        modalBackdropLevels = 0,
        $modalBackdrop = null;

    /******************************************************
    $.fn._setModalBackdropZIndex
    Set the z-index of this to the current level
    If delta === true the z-index is set to zindexAllwaysOnTop (9999)
    ******************************************************/
    $.fn._setModalBackdropZIndex = function( delta ){
        this.css('z-index', delta === true  ? zindexAllwaysOnTop : zindexModalBackdrop + modalBackdropLevels*10  + (delta?delta:0));
        return this;
    };

    /******************************************************
    $._addModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    $._addModalBackdropLevel = function(){
        modalBackdropLevels++;

        if (!$modalBackdrop)
            $modalBackdrop =
                $('<div/>')
                    .addClass('global-backdrop')
                    .appendTo( $('body') );

        $modalBackdrop
            ._setModalBackdropZIndex( -1 )
            .removeClass('hidden')
            .addClass('show');
    };

    /******************************************************
    $._removeModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    $._removeModalBackdropLevel = function(){
        modalBackdropLevels--;

        $modalBackdrop._setModalBackdropZIndex( -1 );
        if (!modalBackdropLevels){
            $modalBackdrop
                .removeClass('show');
            window.setTimeout( function(){
                $modalBackdrop.addClass('hidden');
            }, 200 );

        }
    };
}(jQuery, this, document));