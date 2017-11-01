/****************************************************************************
	jquery-bootstrap-noty.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";


    /******************************************************
    To be able to have Noty on top of modal-windows the notys are
    placed in different containers with increasing and decreasing
    z-index.
    A new container is added when a modal-window or modal noty is open
    All noty in the top container is closed when the modal-window or
    modal noty is closed. E.q. all noty opened on top of a modal-window is automatic
    closed when the modal-window is closed
    ******************************************************/
    var bsNotyLayerList = [];
    var $bsNotyLayer = null;

    function notyQueueName(){
        return 'bsNotyQueue'+ bsNotyLayerList.length;
    }

    //$._bsNotyAddLayer: add a new container for noty-containers
    $._bsNotyAddLayer = function(){

        $bsNotyLayer =
            $('<div/>')
                .addClass('noty-layer')
                .appendTo( $('body') );

        bsNotyLayerList.push( $bsNotyLayer );

        $bsNotyLayer
            .attr('id', notyQueueName())
            ._setModalBackdropZIndex()
    }


    //$._bsNotyRemoveLayer: close all noty in current layer and remove the layer
    $._bsNotyRemoveLayer = function(){
        //Close all noty in current layer
        Noty.closeAll(notyQueueName());

        //Remove the layer
        bsNotyLayerList.pop().remove();

        $bsNotyLayer = bsNotyLayerList[ bsNotyLayerList.length - 1];

        //Move down or hide the backdrop
        $._removeModalBackdropLevel();
    }


    /******************************************************
    Setting default options for Noty
    ******************************************************/
    Noty.overrideDefaults({
        theme    : 'jquery-bootstrap'
    });


    var defaultNotyOptions = {
        layout   : 'topCenter',
        type     : 'info',
        closeWith: ['click', 'button'],
        textAlign: 'left',
        show     : true,
    };


    $.bsNoty = function(options){
        options = $.extend({}, defaultNotyOptions, options );

        //Set animation from layout
        var animateOpen = 'fadeIn',
            animateClose = 'fadeOut';
        if (options.layout.indexOf('top') == 0){
            //top, topLeft, topCenter, topRight
            animateOpen  = 'fadeInDown';
            animateClose = 'fadeOutUp';
        }
        else
        if (options.layout.indexOf('bottom') == 0){
            //bottom, bottomLeft, bottomCenter, bottomRight
            animateOpen  = 'fadeInUp';
            animateClose = 'fadeOutDown';
        }
        else
        if (options.layout == 'centerLeft'){
            //centerLeft
            animateOpen  = 'fadeInLeft';
            animateClose = 'fadeOutLeft';
        }
        else
        if (options.layout == 'centerRight'){
            //centerRight
            animateOpen  = 'fadeInRight';
            animateClose = 'fadeOutRight';
        }
        else
        if (options.layout == 'center'){
            //centerRight
            animateOpen  = 'fadeIn';
            animateClose = 'fadeOut';
        }

        options.animation = {
            open : 'animated ' + animateOpen,
            close: 'animated ' + animateClose
        };

        //Save closeWith and remove 'button' to prevent default close-button
        var closeWith = options.closeWith;
        options.closeWith = closeWith.includes('click') ? ['click'] : [];

        //Save show and create the noty hidden
        var show = options.show;
        options.show = false;

        //Save text and create the noty empty
        var text = options.text;
        options.text = '';

        //Force no progressBar
        options.progressBar = false;


        //Always force when modal
        options.force = options.force || options.modal;


        //Add callbacks.onTemplate to add content (and close-icon)
        options.callbacks = options.callbacks || {};

        options.callbacks.onTemplate = function() {
            var _this = this,
                $barDom = $(this.barDom),
                $body = $barDom.find('.noty_body');

            //Replace content with text as object {icon, txt,etc}
            $body._bsAddHtml( text || options.content );

            $body.addClass('text-'+options.textAlign);

            if (closeWith.includes('button'))
                //Add same close-icon as for modal-windows
                $('<div/>')
                    ._bsAddBaseClassAndSize( {
                        baseClass   :'header-icon-container',
                        useTouchSize: true
                    })
                    .appendTo($barDom)
                    .append(
                        $('<i/>')
                            .addClass("header-icon header-icon-close")
                            .on('click', function( event ){
                                event.stopPropagation();
                                _this.close();
                            })
                    );
        }


        //If it is a modal noty => add/move up backdrop
        if (options.modal)
            $._addModalBackdropLevel();

        //Find or create layer and container for the noty
        if (!$bsNotyLayer || options.modal){
            $._bsNotyAddLayer();
        }
        var classNames = '.noty-container.noty-container-'+options.layout,
            $container = $bsNotyLayer.find(classNames);
        if (!$container.length){
            $container =
                $('<div/>')
                    .addClass( classNames.split('.').join(' ') )
                    .appendTo( $bsNotyLayer );
        }

        options.container = '#' + notyQueueName() + ' ' + classNames;

        var result = new Noty( options );

        //If it is a modal noty => remove/move down backdrop when closed
        if (options.modal)
            result.on('afterClose', $._bsNotyRemoveLayer);

        if (show)
            result.show();
        return result;
    };






}(jQuery, this, document));