/****************************************************************************
	jquery-bootstrap-modal-file.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";


    var objectWithFileClasses = 'border-0 w-100 h-100';

    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsExternalLinkIcon = 'fa-external-link-alt';

    /**********************************************************
    modalFileLink( fileName, bsModalOptions )
    Return a link to bsModalFile
    **********************************************************/
    $.modalFileLink = function( fileName, bsModalOptions ){
        fileName = $._bsAdjustText(fileName);
        return window.PDFObject.supportsPDFs ?
            function(){ return $.bsModalFile( fileName, bsModalOptions ); } :
            fileName;
    };


    /**********************************************************
    updateImgZoom( $im)
    **********************************************************/
    var ZoomControl = function( $img ){
        this.$img = $img;
        this.zooms = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];
        this.zoomIndex = this.zooms.indexOf(100);
    };

    ZoomControl.prototype = {
        getButtons: function(){
            var _this = this;
            this.$zoomOutButton = $.bsButton({type:'button', icon:'fa-search-minus',  text:{da:'Zoom ud',  en:'Zoom Out'}, onClick: _this.zoomOut, context: _this });
            this.$zoomInButton  = $.bsButton({type:'button', icon:'fa-search-plus',   text:{da:'Zoom ind', en:'Zoom In'},  onClick: _this.zoomIn,  context: _this });

            return [this.$zoomOutButton, this.$zoomInButton];
        },

        zoomIn : function(){ this.update(false); },
        zoomOut: function(){ this.update(true);  },

        mousewheel: function( event ){
            var delta =
                    event.deltaX ? event.deltaX :
                    event.deltaY ? event.deltaY :
                    0;
            if (delta)
                this.update( delta < 0 );
            event.stopPropagation();
            event.preventDefault();
        },

        update: function(zoomOut){
            this.zoomIndex = this.zoomIndex + (zoomOut ? -1 : + 1);
            this.zoomIndex = Math.max( 0, Math.min( this.zoomIndex, this.zooms.length-1) );

            this.$img.css('width', this.zooms[this.zoomIndex]+'%');
            var isMin = this.zoomIndex == 0;
            var isMax = this.zoomIndex == this.zooms.length-1;

            this.$zoomOutButton.attr('disabled', isMin).toggleClass('disabled', isMin);
            this.$zoomInButton.attr('disabled', isMax).toggleClass('disabled', isMax);
         }
    };


    /**********************************************************
    bsModalFile( fileName, options )
    **********************************************************/
    $.bsModalFile = function( fileName, options = {} ){
        fileName = $._bsAdjustText(fileName);
        var theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $content,
            footer = {
                da: 'Hvis filen ikke kan vises, klik på <i class="' +           $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"></i> for at se dokumentet i en ny fane',
                en: 'If the file doesn\'t show correctly click on <i class="' + $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"></i> to see the document in a new Tab Page'
            },
            fullWidth       = true,
            noPadding       = true,
            scroll          = false,
            alwaysMaxHeight = true;

        fileNameExt = fileNameExt ? fileNameExt.toLowerCase() : 'unknown';

        //Check for ext == 'pdf' and support for pdf
        if ((fileNameExt == 'pdf') && !window.PDFObject.supportsPDFs){
            $content =
                $('<div/>')
                    .addClass('text-center')
                    ._bsAddHtml({text: {
                        da: 'Denne browser understøtter ikke visning<br>af pdf-filer i popup-vinduer<br>Klik på <i class="' + $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                        en: 'This browser does not support<br>pdf-files in popup windows<br>Click on <i class="' +            $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"/> to see the document<br>in a new Tab page'
                    }});
            fullWidth       = false;
            footer          = null;
            noPadding       = false;
            alwaysMaxHeight = false;

        }
        else {
            switch (fileNameExt){
                //*********************************************
                case 'pdf':
                    //passes a jQuery object (HTML node) for target
                    $content = $('<div/>').addClass(objectWithFileClasses);
                    window.PDFObject.embed(
                        theFileName,
                        $content,
                        { pdfOpenParams: { view: 'FitH' } }
                    );
                    break;

                //*********************************************
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'png':
                case 'tiff':
                case 'bmp':
                case 'ico':
                    var $iframe =
                            $('<iframe></iframe>')
                                .addClass(objectWithFileClasses),
                        $img =
                            $('<img src="' + theFileName + '"/>')
                                .css('width', '100%');

                    //Create a ZoomControl to zoom in and out
                    var zoomControl = new ZoomControl( $img );

                    //Add the images to the iframe when the iframe is loaded into the DOM
                    setTimeout( function(){
                        var contents = $iframe.contents(),
                            $iframeBody = contents.find('body')/*,
                            $iframeHead = contents.find('head')*/;

                        $iframeBody.on('mousewheel', $.proxy( zoomControl.mousewheel, zoomControl ) );
                        $iframeBody.append($img);

                        /* Try to adjust style of iframe - Not working
                        var style = document.createElement('style');
                        style.type = 'text/css';
                        style.innerHTML =
                            'body { scrollbar-width: thin; scrollbar-color: #cdcdcd white;; }; ' +
                            'html ::-webkit-scrollbar-thumb {background-color: #cdcdcd; border-radius: 6px; border: 1px solid white; box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5); }';
                        $iframeHead.append(style);

                        //Or by css-file
                        var cssLink = document.createElement("link");
                        cssLink.href = "style.css";
                        cssLink.rel = "stylesheet";
                        cssLink.type = "text/css";
                        $iframeHead.append(cssLink);
                        */
                    }, 200);

                    $content = [
                        $iframe,
                        $('<div></div>')
                            .addClass('modal-footer')
                            .css('justify-content',  'center')
                            ._bsAppendContent( zoomControl.getButtons() )
                    ];

                    scroll = false;
                    break;

                //*********************************************
                case 'html':
                case 'unknown':
                    $content = $('<iframe src="' + theFileName + '"/>').addClass(objectWithFileClasses);
                    break;

                //*********************************************
                default:
                    //Try default <object> to display the file
                    $content = $('<object data="' + theFileName + '"/>').addClass(objectWithFileClasses);

            } //end of switch (fileNameExt){...
        }

        //Create the bsModal
        return $.bsModal({
                    header    : options.header,
                    scroll    : scroll,
                    flexWidth : fullWidth,
                    megaWidth : fullWidth,

                    noVerticalPadding  : noPadding,
                    noHorizontalPadding: noPadding,
                    alwaysMaxHeight    : alwaysMaxHeight,

                    buttons   : [{text: {da: 'Åbne', en: 'Open'}, icon: $.bsExternalLinkIcon, link: fileName }],
                    content   : $content,
                    footer    : footer

               });
    };

}(jQuery, this.i18next, this, document));