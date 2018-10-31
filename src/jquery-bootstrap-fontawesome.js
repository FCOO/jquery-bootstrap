/****************************************************************************
	jquery-bootstrap-fontawesome.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /*******************************************
    $.bsMarkerIcon(colorClassName, borderColorClassName)
    Return options to create a marker-icon = round icon with
    inner color given as color in colorClassName and
    border-color given as color in borderColorClassName
    partOfList: true if the icon is part of a list
    faClassName: alternative fa-class for symbol
    ********************************************/
    $.bsMarkerIcon = function(colorClassName, borderColorClassName, partOfList, faClassName){
        colorClassName       = colorClassName || 'text-white';
        borderColorClassName = borderColorClassName || 'text-black';
        faClassName          = faClassName || 'fa-circle';
        var result = [
            'fas ' + faClassName + ' ' + colorClassName,
            'far ' + faClassName + ' ' + borderColorClassName
        ];
        return partOfList ? result : [result];
    };

}(jQuery, this, document));