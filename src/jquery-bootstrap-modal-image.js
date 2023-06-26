/****************************************************************************
    jquery-bootstrap-modal-image.js

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsModalImage = function( fileName, options = {} )
    Displays one image in a full screen modal window


****************************************************************************/

(function ($, i18next, window /*, document, undefined*/) {
	"use strict";

    var pinchZoomId = 0;

    $.bsModalImage = function( fileName, options ){
        var id = 'pinchZoom'+ pinchZoomId++,
            theFileName = i18next.sentence( $._bsAdjustText(fileName) ),

            $imgContainer = $('<div/>').addClass('zoomHolder w-100 h-100'),
            $img = $('<img id="'+id+'" src="' + theFileName + '"/>')
                    .appendTo($imgContainer),

            footer          = [],
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
                    .addClass(footerTextClass + ' font-size-0-9em')
                    ._bsAddHtml({icon: options.subIcon, text: options.subText})
            );


        //Create the bsModal
        var $result = $.bsModal({
            fullScreen: true,
            header    : options.header,
            noHeader  : !options.header,

            scroll    : false,

            noVerticalPadding  : true,
            noHorizontalPadding: true,

            buttons   : [{
                id      : 'auto-zoom',
                icon    : 'fa-expand',
                type    : 'checkboxbutton',
                square  : true,
                selected: true,
                onChange: function(id, selected){ $result.autoZoomToggle(selected); }
            },{
                id     : 'one-to-one',
                text   : '1:1',
                square : true,
                onClick: function(){ $result.originalSize(); }
            },{
                icon   : 'fa-magnifying-glass-plus',
                square : true,
                onClick: function(){ $result.pz.zoomIn(); }
            },{
                icon   : 'fa-magnifying-glass-minus',
                square : true,
                onClick: function(){ $result.pz.zoomOut(); }
            }],
            smallButtons: true,

            content    : $imgContainer,
            className:'overflow-hidden',

            footer     : footer,
            footerClass: 'flex-column',

            remove       : options.remove,
            removeOnClose: options.removeOnClose,
            defaultRemove: true
        });


        $result.extend( bsModalImage_prototype );
        $result.$img          = $img;
        $result.$imgContainer = $imgContainer;

        $img.on('load', $result.onLoad.bind($result) );

        return $result;

    };   //End of BsModalImage( fileName, options = {} ){

    /*******************************************************
    Extend the prototype of BsModalImage
    *******************************************************/

    var bsModalImage_prototype = {
        onLoad: function(){
            var $content = this.bsModal.$content,
                $img     = this.$img;

            this.imgWidth       = $img.width();
            this.imgHeight      = $img.height();
            this.viewportWidth  = $content.outerWidth();
            this.viewportHeight = $content.outerHeight();

            this.autoZoomScaleMode = 'proportionalInside';
            this.autoZoomOn = true;

            //minZoom set to ensure smallest image = 80px
            var maxDim = Math.max(this.imgWidth, this.imgHeight),
                minZoom = window.nearest(80/maxDim, .1);

            $img.width(this.imgWidth).height(this.imgHeight);

            $img.data('elem', 'pinchzoomer');
            $img.pinchzoomer({
                preloaderUrl: $img.attr('src'),
                minZoom     : minZoom,
                maxZoom     : 10,
                scaleMode   : this.autoZoomScaleMode,
                adjustHolderSize: false,
            }, false);

            this.pz = this.pinchZoomer = window.PinchZoomer.get($img.attr('id'));
            this.pinchZoomer.on(window.PinchZoomer.ZOOM, this.autoZoomOff.bind( this ) );

            //Zoom in and out using mouse-wheel plus resize
            $content
                .on('mousewheel', this._on_mousewheel.bind(this) )
                .resize( this._on_resize.bind(this) );

            //Find the auto-zoom button
            this.$autoZoomButton = this.bsModal.$buttonContainer.find('#auto-zoom');
        },

        _on_resize : function(){
            this.viewportWidth  = this.bsModal.$content.outerWidth();
            this.viewportHeight = this.bsModal.$content.outerHeight();
        },

        _on_mousewheel: function(e){
            //If mouse outside image => zoom in or out
            if (e.target === this.$img.get(0)) return;
            if (e.deltaY == 1)
                this.pz.zoomIn();
            if (e.deltaY == -1)
                this.pz.zoomOut();
        },


        originalSize: function(){
            this.autoZoomToggle(false);
            this.pz.zoom(1);
        },

        autoZoomOff: function(){
            if (!this.dontCall_autoZoomToggle)
                this.autoZoomToggle(false);
        },

        autoZoomToggle: function(on){
            if (this.autoZoomOn == on) return;

            this.autoZoomOn = on;
            this.$autoZoomButton._cbxSet(on, true);

            this.pz.vars({ scaleMode: on ? this.autoZoomScaleMode : 'none' });

            if (on){
                this.dontCall_autoZoomToggle = true;
                this.pz.zoom(1, 0);
                this.dontCall_autoZoomToggle = false;
            }
        },
    };

}(jQuery, this.i18next, this, document));