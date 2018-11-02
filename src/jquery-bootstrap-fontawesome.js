/****************************************************************************
	jquery-bootstrap-fontawesome.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /*******************************************
    $.bsMarkerIcon(colorClassName, borderColorClassName, options)
    Return options to create a marker-icon = round icon with
    inner color given as color in colorClassName and
    border-color given as color in borderColorClassName
    options:
        faClassName: fa-class for symbol. Default = "fa-circle"
        extraClassName: string or string[]. Extra class-name added
        partOfList : true if the icon is part of a list => return [icon-name] instead of [[icon-name]]
    ********************************************/
    $.bsMarkerIcon = function(colorClassName, borderColorClassName, options){
        options = $.extend({
            faClassName   : 'fa-circle',
            extraClassName: '',
            partOfList    : false
        }, options || {});

        colorClassName       = colorClassName || 'text-white';
        borderColorClassName = borderColorClassName || 'text-black';

        var className =
                options.faClassName + ' ' +
                ($.isArray(options.extraClassName) ? options.extraClassName.join(' ') : options.extraClassName) +
                ' ';
        var result = [
            'fas ' + className + colorClassName,
            'far ' + className + borderColorClassName
        ];

        return options.partOfList ? result : [result];
    };

}(jQuery, this, document));