/****************************************************************************
	jquery-bootstrap-noty.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, Noty, window, document/*, undefined*/) {
	"use strict";


    /******************************************************
    To be able to have Noty on top of modal-windows the notys are
    placed in different containers with increasing and decreasing
    z-index.
    A new container is added when a modal-window or modal-noty is open
    All noty in the top container is closed when the modal-window or
    modal noty is closed. E.q. all noty opened on top of a modal-window is automatic
    closed when the modal-window is closed
    If options.onTop: true the noty is placed in a container that is allways on the top of other elements
    ******************************************************/


    var bsNotyLayerList   = [],
        $bsNotyLayer      = null,
        $bsNotyLayerOnTop = null;

    //Global pointer to current modal noty (if any)
    window._bsNotyModal = null;

    //Add global event-function to close modal-noty by pressing esc
    $(document).keydown( function( event ){
        if (window._bsNotyModal && (event.which == 27))
            window._bsNotyModal.close();
    });


    function notyQueueName(isOnTopLayer){
        return 'bsNotyQueue'+ (isOnTopLayer ? 'ONTOP' : bsNotyLayerList.length);
    }

    //$._bsNotyAddLayer: add a new container for noty-containers
    $._bsNotyAddLayer = function( isOnTopLayer ){

        var $result =
            $('<div/>')
                .addClass('noty-layer')
                .appendTo( $('body') );

        if (!isOnTopLayer)
            bsNotyLayerList.push( $result );

        $result
            .attr('id', notyQueueName( isOnTopLayer ))
            ._setModalBackdropZIndex( isOnTopLayer );

        if (isOnTopLayer)
            $bsNotyLayerOnTop = $result;
        else
            $bsNotyLayer = $result;
    };


    //$._bsNotyRemoveLayer: close all noty in current layer and remove the layer
    $._bsNotyRemoveLayer = function(){
        //Close all noty in current layer
        Noty.closeAll(notyQueueName());

        //Remove the layer
        bsNotyLayerList.pop().remove();

        $bsNotyLayer = bsNotyLayerList[ bsNotyLayerList.length - 1];

        //Move down or hide the backdrop
        $._removeModalBackdropLevel();
    };


    /******************************************************
    Setting default options for Noty
    ******************************************************/
    Noty.overrideDefaults({
        theme: 'jquery-bootstrap'
    });


    var defaultNotyOptions = {
        layout   : 'topCenter',
        type     : 'info',
        closeWith: ['click'],
        textAlign: 'left',
        onTop    : false,
        show     : true,
    };


    $.bsNoty = function(options){
        options = $.extend({}, defaultNotyOptions, options );

        if (options.type == 'information')
            options.type = 'info';

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

        //Save buttons and remove if from options to prevent default buttons
        var buttons = options.buttons;
        options.buttons = null;

        //Save closeWith and remove 'button' to prevent default close-button
        var closeWith = options.closeWith,
            closeWithButton = closeWith.indexOf('button') >= 0,
            closeWithClick = closeWith.indexOf('click') >= 0;

        //Adjust closeWith
        if (options.buttons)
            closeWithClick = false;

        options.closeWith = closeWithClick ? ['click'] : [];


        //Save show and create the noty hidden
        var show = options.show;
        options.show = false;

        //Create the noty empty and create the content in options.content
        options.content = options.content || options.text;
        options.text = '';

        //Add header (if any)
        if (options.header || options.defaultHeader){
            if (!$.isArray(options.content))
                options.content = [options.content];

            options.header = options.header || {};

            if ($.type( options.header ) == "string")
                options.header = {text: options.header };

            var headerOptions =
                options.defaultHeader ?
                $.extend({},
                    {
                        icon: $.bsNotyIcon[options.type],
                        text: $.bsNotyName[options.type]
                    }, options.header || {})
                : options.header || {};
        }

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

            //Insert header before $body (if any)
            //Use small header unless it is touch-mode and close with button (round x)
            if (headerOptions)
                $('<div/>')
                    ._bsAddBaseClassAndSize( {
                        baseClass   :'noty-header',
                        useTouchSize: closeWithButton,
                        small       : !closeWithButton
                    })
                    ._bsAddHtml( headerOptions )
                    .insertBefore( $body );

            //Replace content with text as object {icon, txt,etc}
            $body._bsAddHtml( options.content );
            $body.addClass('text-'+options.textAlign);

            var closeFunc = function( event ){
                                event.stopPropagation();
                                _this.close();
                            };

            //Add buttons (if any)
            if (buttons){
                var $buttonContainer =
                        $('<div/>')
                            .addClass('noty-buttons modal-footer')  //modal-footer from Bootstrap also used in modal-windows for button-container
                            .insertAfter($body),
                    defaultButtonOptions = {
                        closeOnClick: true
                    };

                $.each( buttons, function( index, buttonOptions ){
                    buttonOptions = $.extend(true, defaultButtonOptions, buttonOptions );
                    var $button = $.bsButton(buttonOptions).appendTo($buttonContainer);
                    if (buttonOptions.closeOnClick)
                        $button.on('click', closeFunc );
                });
            }

            //Add footer (if any)
            if (options.footer){
                $('<div/>')
                    .addClass('noty-footer')
                    .addClass('text-' + (options.footer.textAlign || 'left'))
                    ._bsAddHtml( options.footer )
                    .insertAfter($body);
            }

            if (closeWithButton)
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
                            .on('click', closeFunc )
                    );
        };


        var $bsNotyLayerToUse; //The noty-layer to contain the noty

        //If it is a modal noty => add/move up backdrop
        if (options.modal)
            $._addModalBackdropLevel();

        //Find or create layer and container for the noty
        if (options.onTop){

            if (!$bsNotyLayerOnTop)
                $._bsNotyAddLayer(true);
            $bsNotyLayerToUse = $bsNotyLayerOnTop;
        }
        else {
            if (!$bsNotyLayer || options.modal)
                $._bsNotyAddLayer();
            $bsNotyLayerToUse = $bsNotyLayer;
        }

        var classNames = '.noty-container.noty-container-'+options.layout,
            $container = $bsNotyLayerToUse.find(classNames);
        if (!$container.length){
            $container =
                $('<div/>')
                    .addClass( classNames.split('.').join(' ') )
                    .appendTo( $bsNotyLayerToUse );
        }

        options.container = '#' + notyQueueName(options.onTop) + ' ' + classNames;





        var result = new Noty( options );

        //If it is a modal noty => remove/move down backdrop when closed
        if (options.modal){
            result.on('afterClose', $._bsNotyRemoveLayer);

            result.on('onShow', function(){
                this.prevBsNotyModal = window._bsNotyModal;
                window._bsNotyModal = this;
            });
            result.on('afterClose', function(){
                window._bsNotyModal = this.prevBsNotyModal;
            });

    }


        if (show)
            result.show();

        return result;
    };


    /********************************************************************
    *********************************************************************
    Create standard variations of bsNoty:
    notySuccess/notyOk, notyError, notyWarning, notyAlert, notyInfo (and dito $bsNoty[TYPE]
    The following default options is used
    queue: "global" but if != "global" options.killer is set to options.queue
    killer: if options.queue != "global" => killer = queue and the noty will close all noty with same queue.
            To have unique queue and prevent closing: set options.killer: false
            To close all noty set options.killer: true
    timeout: If type="warning" or "success" timeout is set to 3000ms. Can be avoided by setting options.timeout: false
    defaultHeader: If type = "error": defaultHeader = true
    textAlert: left if any header else center
    closeWith: if the noty has buttons then only button else only click
    *********************************************************************
    *********************************************************************/
    //$.bsNotyIcon = icon-class for different noty-type
    $.bsNotyIcon = {
        info        : 'fa-info-circle',
        information : 'fa-info-circle',
        alert       : '',
        success     : 'fa-check',
        error       : 'fa-ban',
        warning     : 'fa-exclamation-triangle',
        help        : 'fa-question-circle'
    };

    //$.bsNotyName = Name for different noty-type
    $.bsNotyName = {
        info        : {da:'Information', en:'Information'},
        information : {da:'Information', en:'Information'},
        alert       : {da:'Bemærk', en:'Note'},
        success     : {da:'Succes', en:'Success'},
        error       : {da:'Fejl', en:'Error'},
        warning     : {da:'Advarsel', en:'Warning'},
        help        : {da:'Hjælp', en:'Help'}
    };



    /***************************************************************
    window.notyDefault
    Noty with default options as descried above
    ****************************************************************/
    function notyDefault( type, text, options ){
        options = options || {};

        options.type = type;

        //Simple test if text=string or {da:"...", en:"..."} or {icon:"...", text:{da:"...", en:"..."}
        if ($.isPlainObject(text) && !text.icon && !text.text)
            text = {text:text};

        options.content = text;

        //Set killer
        if (options.queue && (options.killer !== false) && (options.killer !== true))
            options.killer = options.queue;

        //Set timeout
        if ( ((options.type == 'warning') || (options.type == 'success')) && !options.buttons && (!options.timeout || (options.timeout !== false)) )
            options.timeout = options.timeout || 3000;
        options.force = options.force || (options.timeout);

        //defaultHaeder
        options.defaultHeader = !options.header && (options.defaultHeader || ((options.type == 'error') && (options.defaultHeader !== false)));

        //text-align: center if no header
        options.textAlign = options.textAlign || (options.header || options.defaultHeader ? 'left' : 'center');

        //Set closeWith
        options.closeWith = options.closeWith || (options.buttons ? ['button'] : ['click']);

        return $.bsNoty( options );

    }

    /***************************************************************
    window.notySuccess / $.bsNotySuccess / window.notyOk / $.bsNotyOk
    Simple centered noty with centered text
    ****************************************************************/
    window.notySuccess = $.bsNotySuccess = window.notyOk = $.bsNotyOk = function( text, options ){
        return  notyDefault(
                    'success',
                    {icon: $.bsNotyIcon['success'], text: text},
                    $.extend( options || {}, {layout: 'center'})
                );
    };

    /***************************************************************
    window.notyError / $.bsNotyError: Simple error noty with header
    ****************************************************************/
    window.notyError = $.bsNotyError = function( text, options ){
        return  notyDefault( 'error', text, options );
    };

    /***************************************************************
    window.notyWarning / $.bsNotyWarning: Simple warning noty with header
    ****************************************************************/
    window.notyWarning = $.bsNotyWarning = function( text, options ){
        return  notyDefault( 'warning', text, options );
    };

    /***************************************************************
    window.notyAlert / $.bsNotyAlert: Simple alert noty with header
    ****************************************************************/
    window.notyAlert = $.bsNotyAlert = function( text, options ){
        return  notyDefault( 'alert', text, options );
    };

    /***************************************************************
    window.notyInfo / $.bsNotyInfo: Simple info noty with header
    ****************************************************************/
    window.notyInfo = $.bsNotyInfo = function( text, options ){
        return  notyDefault( 'info', text, options );
    };


    /******************************************************************************
    window.noty: Replacing window.noty from noty^2.4.1 that was removed in noty^3
    *******************************************************************************/
    window.noty = function( options ){
        return $.bsNoty($.extend({}, {
            content: options.text || options.content,
            show   : true
        }, options));
    };

}(jQuery, this.Noty, this, document));