/****************************************************************************
	jquery-bootstrap-modal-backdrop.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    Global methods to provide backdrop for modal windows and noty

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    $.bsZIndexModalBackdrop = 1050; //MUST be equal to $zindex-modal-backdrop in bootstrap/scss/_variables.scss

    var zindexAllwaysOnTop  = 9999,
        modalBackdropLevels = 0,

        $modalBackdrop_current = null,
        $modalBackdrop = null,
        $modalTransparentBackdrop = null;

    /******************************************************
    $.fn._setModalBackdropZIndex
    Set the z-index of this to the current level
    If a className is given => use it, else
    If delta === true the z-index is set to zindexAllwaysOnTop (9999), else
    increase current z-index by 10
    ******************************************************/
    $.fn._setModalBackdropZIndex = function( delta, className ){
        if (className)
            this.addClass( className );
        else
            this.css('z-index', delta === true ? zindexAllwaysOnTop : $.bsZIndexModalBackdrop + modalBackdropLevels*10  + (delta?delta:0));
        return this;
    };

    /******************************************************
    $._addModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    function addAnyModalBackdropLevel( $modalBD, transparent ){
        modalBackdropLevels++;

        if (!$modalBD)
            $modalBD =
                $('<div/>')
                    .append( $('<i/>')._bsAddHtml({icon:'fa-spinner fa-spin'}) )
                    .addClass('global-backdrop')
                    .toggleClass('transparent', !!transparent)
                    .appendTo( $('body') );

        $modalBD
            ._setModalBackdropZIndex( -1 )
            .removeClass('hidden')
            .addClass('show');

        return $modalBD;
    }

    $._addModalBackdropLevel = function(transparent){
        if (transparent)
            $modalBackdrop_current = $modalTransparentBackdrop = addAnyModalBackdropLevel($modalTransparentBackdrop, true);
        else
            $modalBackdrop_current = $modalBackdrop = addAnyModalBackdropLevel($modalBackdrop);
    };

    /******************************************************
    $._removeModalBackdropLevel
    Move the backdrop down in z-index
    ******************************************************/
    $._removeModalBackdropLevel = function( noDelay ){
        var isTransparentBD = ($modalBackdrop_current === $modalTransparentBackdrop);

        modalBackdropLevels--;

        $modalBackdrop_current._setModalBackdropZIndex( -1 );
        if (!modalBackdropLevels || isTransparentBD){
            $modalBackdrop_current
                .removeClass('show');
            if (noDelay || isTransparentBD)
                $modalBackdrop_current.addClass('hidden');
            else
                window.setTimeout( function(){ $modalBackdrop_current.addClass('hidden'); }, 2000 );
        }

        if ($modalBackdrop_current === $modalTransparentBackdrop)
            $modalBackdrop_current = $modalBackdrop;

    };


    /******************************************************
    $.workingOn / $.workingOff
    Display/hide a bagdrop while some process is 'working'
    ******************************************************/
    $.workingOn = function(){
        $._addModalBackdropLevel();
        window.setTimeout(function(){
            $modalBackdrop.addClass('working');
        }, 100);
    };
    $.workingOff = function(){
        $._removeModalBackdropLevel(true);
        window.setTimeout(function(){
            $modalBackdrop.removeClass('working');
        }, 100);

    };


}(jQuery, this, document));