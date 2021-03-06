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

    //fileViewModalList = list of {fileNames, bsModal}  where bsModal is the $.bsModalFile showing the file
    var fileViewModalList = [];
    function showFileInModal( fileName, header ){
        var fileViewModal = null,
            fileNames     = fileName.da + fileName.en;
        $.each( fileViewModalList, function( index, fileView ){
            if (fileView.fileNames == fileNames){
                fileViewModal = fileView;
                return false;
            }
        });

        if (!fileViewModal){
            fileViewModal = {
                fileNames: fileNames,
                bsModal  : $.bsModalFile( fileName, {header: header, show: false})
            };
            fileViewModalList.push(fileViewModal);
        }
        fileViewModal.bsModal.show();
    }


    /**********************************************************
    **********************************************************/
    $.bsFileView = $.bsFileview = function( options ){
        options = options || {};
        var fileName    = $._bsAdjustText(options.fileName),
            theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $result     = $('<div/>');

        //Create the header (if any)
        if (options.header)
            $('<div/>')
                .addClass('file-view-header')
                ._bsAddHtml(options.header)
                .appendTo($result);

        //Create the view
        var $container =
                $('<div/>')
                    .addClass('file-view-content text-center')
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
                $container._bsAddHtml({ text: {
                    da: 'Klik på <i class="far fa-window-maximize"/> for at se dokumentet i et nyt vindue<br>Klik på <i class="fas ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                    en: 'Click on <i class="far fa-window-maximize"/> to see the document in a new window<br>Click on <i class="fas ' + $.bsExternalLinkIcon + '"/> to see the document in a new Tab Page'
                }});
        }

        //Create the Show and Open-buttons
        $('<div/>')
            .addClass('modal-footer')
            .css('justify-content',  'center')
            ._bsAppendContent([
                $.bsButton( {icon:'far fa-window-maximize',  text: {da:'Vis',  en:'Show'},   onClick: function(){ showFileInModal( fileName, options.header ); } } ),
                $.bsButton( {icon: $.bsExternalLinkIcon, text: {da: 'Åbne', en: 'Open'}, link: fileName } )
            ])
            .appendTo($result);

        return $result;
    };

}(jQuery, this.i18next, this, document));