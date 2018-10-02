/****************************************************************************
	jquery-bootstrap-modal-pdf.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";



    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsExternalLinkIcon = 'fa-external-link-alt';

    /**********************************************************
    pdfLink( fileName, bsModalPdfOptions )
    Check if the browser supports pdf-object and return a link
    to bsModalPdf or a link to the filename in a new tab
    **********************************************************/
    $.pdfLink = function( fileName, bsModalPdfOptions ){
        return window.PDFObject.supportsPDFs ?
            function(){ return $.bsModalPdf( fileName, bsModalPdfOptions ); } :
            fileName;
    };


    /**********************************************************
    bsModalPdf( fileName, options )
    **********************************************************/
    $.bsModalPdf = function( fileName, options ){
        options = options || {};
        fileName = $._bsAdjustText(fileName);
        var theFileName = window.i18next.sentence(fileName),
            onlyFileName = url('file', theFileName),
            fileNameExt = url('fileext', theFileName).toLowerCase(),
            $content,
            fullWidth = true;

        //Check for ext == 'pdf' and support for pdf
        if (fileNameExt == 'pdf'){
            //Check for support of pdf
            if (window.PDFObject.supportsPDFs){
                $content = $('<div/>')
                    .css({
                        width : '100%',
                        height: '100%'
                    });

                //passes a jQuery object (HTML node) for target
                PDFObject.embed(
                    i18next.sentence(fileName),
                    $content,
                    { pdfOpenParams: { view: 'FitH' } }
                );
            }
            else {
                fullWidth = false;
                $content =
                    $('<div/>')
                        .addClass('text-center')
                        ._bsAddHtml({text: {
                            da: 'Denne browser understøtter ikke visning<br>af pdf-filer i popup-vinduer<br>Klik på <i class="fas ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                            en: 'This browser does not support<br>pdf-files in popup windows<br>Click on <i class="fas ' + $.bsExternalLinkIcon + '"/> to see the document<br>in a new Tab page'
                        }});
            }
        }
        else {
            //Try default <object> to display the file
            $content =
                $('<object data="' + theFileName + '"/>')
                    .css({
                        width : '100%',
                        height: '99%'   //Strange bufix for Chrome ??
                    });

        }

        //Create the bsModal
        return $.bsModal({
                   header    : options.header,
                   scroll    : false,
                   flexWidth : fullWidth,
                   megaWidth : fullWidth,

                   noVerticalPadding  : fullWidth,
                   noHorizontalPadding: fullWidth,
                   alwaysMaxHeight    : fullWidth,

                   buttons   : [{text: {da: 'Åbne', en: 'Open'}, icon: $.bsExternalLinkIcon, link: fileName }],
                   content   : $content
               });
    }

}(jQuery, this, document));