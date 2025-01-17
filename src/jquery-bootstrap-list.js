/****************************************************************************
	jquery-bootstrap-list.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsList( options )
options
    columns = [] of {
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        :  'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
    }

    verticalBorder: [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder      : [boolean] true. When true no borders are visible

    align        : 'left','center','right'. Defalut = 'left' = default align for all columns
    verticalAlign: 'top', 'middle','bottom'. Default = 'middle' = default verticalAlign for all columns



*******************************************************************/
    var defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            sortable     : false
        },

        defaultOptions = {
            showHeader      : false,
            verticalBorder  : false,
            noBorder        : true,
            hoverRow        : false,
            noPadding       : true,

            align           : defaultColunmOptions.align,
            verticalAlign   : defaultColunmOptions.verticalAlign,

            content         : []
        };

    $.bsList = function( options ){
        //Adjust options but without content since it isn't standard
        var content = options.content;
        options.content = [];
        options = $._bsAdjustOptions( options, defaultOptions );
        options.content = content;

        var nofColumns = 1;
        //Adjust options.content and count number of columns
        options.content.forEach( ( rowContent, index ) => {
            rowContent = Array.isArray( rowContent ) ? rowContent : [rowContent];
            nofColumns = Math.max(nofColumns, rowContent.length);

            var rowContentObj = {};
            rowContent.forEach( ( cellContent, index ) => {
                rowContentObj['_'+index] = cellContent;
            });

            options.content[index] = rowContentObj;
        });

        options.columns = options.columns || [];
        var optionsAlign = {
                align        : options.align,
                verticalAlign: options.verticalAlign
            };

        //Create columns-options for bsTable
        for (var i=0; i<nofColumns; i++ )
            options.columns[i] = $.extend({id:'_'+i}, defaultColunmOptions, optionsAlign, options.columns[i]);

        return $.bsTable( options );
    };
}(jQuery, this, document));