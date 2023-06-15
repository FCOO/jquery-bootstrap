/****************************************************************************
    jquery-bootstrap-modal-image.js

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";

    $.bsModalImage = function( fileName, options = {} ){
        fileName = $._bsAdjustText(fileName);
        var theFileName = i18next.sentence(fileName);

var $div = $('<div/>').addClass('pinch-zoom-container')

// HER>  <div class="pinch-zoom-container">
// HER>       <img id="pinch-zoom-image-id" class="pinch-zoom-image" onload="onLoad()"

var $content =
        $('<img id="pinch-zoom-image-id" src="' + theFileName + '"/>')
            .addClass('pinch-zoom-image')
            .on('load', onLoad )
            .appendTo($div);



console.log(options);

        var footer          = [],
            footerTextClass = 'd-block w-100 text-center caption';
        if (options.icon || options.text)
            footer.push(
                $('<div/>')
                    .addClass(footerTextClass)
                    ._bsAddHtml({icon: options.icon, text: options.text})
            );
        if (options.subIcon || options.subText)
            footer.push(
                $('<div/>')
                    .addClass(footerTextClass + ' caption-sm')
                    ._bsAddHtml({icon: options.subIcon, text: options.subText})
            );



        //Create the bsModal
        var modal = $.bsModal({
//            header    : options.header,
// HER>             flexWidth : true,
// HER>             megaWidth : true,
maxWidth: true,
            noHeader  : true,

            //scroll: 'both',
scroll: false,
            //noVerticalPadding  : true,
            //noHorizontalPadding: true,
            alwaysMaxHeight    : true,

            buttons   : [{
                icon: $.bsExternalLinkIcon,
                text: {da: 'Åbne', en: 'Open'},
                //link: options.externalFileName || fileName
            }],

            smallButtons: true,

            content    : $div, //$content,
            footer     : footer,
            footerClass: 'flex-column',

            remove       : options.remove,
            removeOnClose: options.removeOnClose,
            defaultRemove: true
        });


        return modal;
    }

    //From https://codepen.io/zamorano_/pen/rzrGZN


    var MIN_SCALE = 1; // 1=scaling when first loaded
    var MAX_SCALE = 64;

    // HammerJS fires "pinch" and "pan" events that are cumulative in nature and not
    // deltas. Therefore, we need to store the "last" values of scale, x and y so that we can
    // adjust the UI accordingly. It isn't until the "pinchend" and "panend" events are received
    // that we can set the "last" values.

    // Our "raw" coordinates are not scaled. This allows us to only have to modify our stored
    // coordinates when the UI is updated. It also simplifies our calculations as these
    // coordinates are without respect to the current scale.
    var imgWidth = null;
    var imgHeight = null;
    var viewportWidth = null;
    var viewportHeight = null;
    var curWidth = null;
    var curHeight = null;


    var scale = null;
    var lastScale = null;
    var container = null;
    var img = null;
    var x = 0;
    var lastX = 0;
    var y = 0;
    var lastY = 0;
    var pinchCenter = null;

    // We need to disable the following event handlers so that the browser doesn't try to
    // automatically handle our image drag gestures.
    var disableImgEventHandlers = function () {
      var events = ['onclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover',
                    'onmouseup', 'ondblclick', 'onfocus', 'onblur'];

      events.forEach(function (event) {
        img[event] = function () {
          return false;
        };
      });
    };

    // Traverse the DOM to calculate the absolute position of an element
    var absolutePosition = function (el) {
      var x = 0,
        y = 0;

      while (el !== null) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }

      return { x: x, y: y };
    };

    var restrictScale = function (scale) {
      if (scale < MIN_SCALE) {
        scale = MIN_SCALE;
      } else if (scale > MAX_SCALE) {
        scale = MAX_SCALE;
      }
      return scale;
    };

    var restrictRawPos = function (pos, viewportDim, imgDim) {

console.log(
'pos='+pos,
'viewportDim='+viewportDim,
'imgDim='+imgDim,
)
/*
      if (pos < viewportDim/scale - imgDim) { // too far left/up?
        pos = viewportDim/scale - imgDim;
      } else if (pos > 0) { // too far right/down?
        pos = 0;
      }
*/
      return pos;
    };

    var updateLastPos = function (deltaX, deltaY) {
      lastX = x;
      lastY = y;
    };

    var translate = function (deltaX, deltaY) {
      // We restrict to the min of the viewport width/height or current width/height as the
      // current width/height may be smaller than the viewport width/height

      var newX = restrictRawPos(lastX + deltaX/scale,
                                  Math.min(viewportWidth, curWidth), imgWidth);
console.log(
'lastX='+lastX,
'deltaX='+deltaX,
'scale='+scale,
'viewportWidth='+viewportWidth,
'curWidth='+curWidth,
'imgWidth='+imgWidth,
'newX='+newX
);
      x = newX;
      img.style.marginLeft = Math.ceil(newX*scale) + 'px';

      var newY = restrictRawPos(lastY + deltaY/scale,
                                  Math.min(viewportHeight, curHeight), imgHeight);
      y = newY;
      img.style.marginTop = Math.ceil(newY*scale) + 'px';
    };

      var zoom = function (scaleBy) {
        scale = restrictScale(lastScale*scaleBy);

        curWidth = imgWidth*scale;
        curHeight = imgHeight*scale;

        img.style.width = Math.ceil(curWidth) + 'px';
        img.style.height = Math.ceil(curHeight) + 'px';

        // Adjust margins to make sure that we aren't out of bounds
        translate(0, 0);
      };

      var rawCenter = function (e) {
        var pos = absolutePosition(container);

        // We need to account for the scroll position
        var scrollLeft = window.pageXOffset ? window.pageXOffset : document.body.scrollLeft;
        var scrollTop = window.pageYOffset ? window.pageYOffset : document.body.scrollTop;

        var zoomX = -x + (e.center.x - pos.x + scrollLeft)/scale;
        var zoomY = -y + (e.center.y - pos.y + scrollTop)/scale;

        return { x: zoomX, y: zoomY };
      };

      var updateLastScale = function () {
        lastScale = scale;
      };

      var zoomAround = function (scaleBy, rawZoomX, rawZoomY, doNotUpdateLast) {
        // Zoom
        zoom(scaleBy);

        // New raw center of viewport
        var rawCenterX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var rawCenterY = -y + Math.min(viewportHeight, curHeight)/2/scale;

        // Delta
        var deltaX = (rawCenterX - rawZoomX)*scale;
        var deltaY = (rawCenterY - rawZoomY)*scale;

        // Translate back to zoom center
        translate(deltaX, deltaY);

        if (!doNotUpdateLast) {
          updateLastScale();
          updateLastPos();
        }
      };

      var zoomCenter = function (scaleBy) {
        // Center of viewport
        var zoomX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var zoomY = -y + Math.min(viewportHeight, curHeight)/2/scale;

        zoomAround(scaleBy, zoomX, zoomY);
      };

      var zoomIn = function () {
        zoomCenter(2);
      };

      var zoomOut = function () {
        zoomCenter(1/2);
      };

      var onLoad = function () {

        img = document.getElementById('pinch-zoom-image-id');
        container = img.parentElement;

        disableImgEventHandlers();

        imgWidth = img.width;
        imgHeight = img.height;
        viewportWidth = img.offsetWidth;
        scale = viewportWidth/imgWidth;
        lastScale = scale;
        viewportHeight = img.parentElement.offsetHeight;
        curWidth = imgWidth*scale;
        curHeight = imgHeight*scale;

        var hammer = new Hammer(container, {
          domEvents: true
        });

        hammer.get('pinch').set({
          enable: true
        });

        hammer.on('pan', function (e) {
          translate(e.deltaX, e.deltaY);
        });

        hammer.on('panend', function (e) {
          updateLastPos();
        });

        hammer.on('pinch', function (e) {

          // We only calculate the pinch center on the first pinch event as we want the center to
          // stay consistent during the entire pinch
          if (pinchCenter === null) {
            pinchCenter = rawCenter(e);
            var offsetX = pinchCenter.x*scale - (-x*scale + Math.min(viewportWidth, curWidth)/2);
            var offsetY = pinchCenter.y*scale - (-y*scale + Math.min(viewportHeight, curHeight)/2);
            pinchCenterOffset = { x: offsetX, y: offsetY };
          }

          // When the user pinch zooms, she/he expects the pinch center to remain in the same
          // relative location of the screen. To achieve this, the raw zoom center is calculated by
          // first storing the pinch center and the scaled offset to the current center of the
          // image. The new scale is then used to calculate the zoom center. This has the effect of
          // actually translating the zoom center on each pinch zoom event.
          var newScale = restrictScale(scale*e.scale);
          var zoomX = pinchCenter.x*newScale - pinchCenterOffset.x;
          var zoomY = pinchCenter.y*newScale - pinchCenterOffset.y;
          var zoomCenter = { x: zoomX/newScale, y: zoomY/newScale };

          zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
        });

        hammer.on('pinchend', function (e) {
          updateLastScale();
          updateLastPos();
          pinchCenter = null;
        });

        hammer.on('doubletap', function (e) {
          var c = rawCenter(e);
          zoomAround(2, c.x, c.y);
        });

      };






































return;


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

                    buttons   : [{
                        icon: $.bsExternalLinkIcon,
                        text: {da: 'Åbne', en: 'Open'},
                        link: options.externalFileName || fileName
                    }],

                    content   : $content,
                    footer    : footer

               });
    };

}(jQuery, this.i18next, this, document));