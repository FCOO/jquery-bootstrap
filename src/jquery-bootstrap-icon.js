/****************************************************************************
jquery-bootstrap-icon.js
****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    $.extend({
        /******************************************************
        $.bsIcon( icon, colorName )
        Return a [] with classes for a icon in color = Bootstrap alert colorName ('success'
        ******************************************************/
        bsIcon: function( icon, colorName ){
            return ['fas '+icon+' BACK-TEXT-COLOR-'+colorName, $.FONTAWESOME_PREFIX +' '+icon+' FRONT-TEXT-COLOR-'+colorName];
        },
    });


}(jQuery, this, document));