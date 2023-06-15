/****************************************************************************
	jquery-bootstrap-file-view.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsFileView creates a <div>-element with viewer of a file (if possible) and
    buttons to view the file in bsModalFile and in a new Tab Page

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";

    var fileViewHeaderClasses = 'modal-header header-content header-content-smaller header-content-inner';

    /**********************************************************
    **********************************************************/
    $.bsFileView = $.bsFileview = function( options = {}){
        var fileName    = $._bsAdjustText(options.fileName),
            theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $result     = $('<div/>')
                            ._bsAddBaseClassAndSize( $.extend({}, options, {
                                baseClass   : 'form-control',
                                class       : 'p-0 mb-1',
                                useTouchSize: true
                            }));


        //Create the header (if any)
        if (options.header)
            $('<div/>')
                .addClass(fileViewHeaderClasses)
                ._bsAddHtml(options.header)
                .appendTo($result);

        //Create the view
        var $container =
                $('<div/>')
                    .addClass('text-center p-1')
                    .appendTo($result);

        switch (fileNameExt){
            //*********************************************
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'png':
            case 'tiff':
            case 'bmp':
            case 'ico':
                $('<img src="' + theFileName + '"/>')
                    .css('width', '100%')
                    .appendTo($container);

                break;

            //*********************************************
            default:
                $container
                    .addClass('text-center')
                    ._bsAddHtml({text: fileName});

                $('<div/>')
                    .removeClass('text-center')
                    .addClass('footer-content flex-column')
                    .appendTo($result)
                    .append(
                        $('<div/>')._bsAddHtml([
                            { text: {da: 'Klik på', en:'Click on'} },
                            { icon: 'fa-window-maximize', text: {da: 'for at se dokumentet i et nyt vindue', en: 'to see the document in a new window'} },
                        ])
                    )
                    .append(
                        $('<div/>')._bsAddHtml([
                            { text: {da: 'Klik på', en:'Click on'} },
                            { icon: $.bsExternalLinkIcon, text: {da: 'for at se dokumentet i en ny fane', en: 'to see the document in a new Tab Page'} },
                        ])
                    );
        }

        //Create the Show and Open-buttons
        $('<div/>')
            .addClass('modal-footer')
            .css('justify-content',  'center')
            ._bsAppendContent([
                $.bsButton(
                    {icon: $.FONTAWESOME_PREFIX + ' fa-window-maximize',
                    text: {da:'Vis',  en:'Show'},
                    onClick: function(){
                        $.bsModalFile( fileName, {header: options.header} );
                    }
                }),
                $.bsButton( {icon: $.bsExternalLinkIcon, text: {da: 'Åbne', en: 'Open'}, link: fileName } )
            ])
            .appendTo($result);

        return $result;
    };

}(jQuery, this.i18next, this, document));