/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document/*, undefined*/) {
	"use strict";


    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        header
        fixedContent
        flex
        noVerticalPadding
        content
        footer 

        buttons = [];

        closeText


        REMOVED - getContentHeight: function( $container ) returns the max height of the content
    **********************************************************/
    var modalId = 0,
        modalStackClassName = 'fv-modal-stack'; //class-name for modals when added to the stack


/* REMOVED
    function default_getContentHeight( $container ){
        return 0;
    }
    function default_postGetContentHeight( $container ){
    }
*/

    //Merthods to allow multi modal-windows
    var openModalDataId = 'bs_open_modals';
    function incOpenModals( number ){
        $('body').data(
            openModalDataId,
            ($('body').data( openModalDataId  ) || 0)
                + (number || 0)
        );
        return $('body').data( openModalDataId  );
     }

    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {

        var $this = $(this);
        // if the z-index of this modal has been set, ignore.
        if ( $this.hasClass( modalStackClassName ) )
            return;

        $this.addClass( modalStackClassName );

        // keep track of the number of open modals
        var modalNumber = incOpenModals( +1 );

        //Move the modal to the front
        $this.css('z-index', 1040 + 10*modalNumber );
    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        var $this = $(this);

        //Update other backdrop
        var modalNumber = incOpenModals();
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .css( 'z-index', 1039 + 10*modalNumber );

        //Set current backdrop
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .addClass( modalStackClassName );

        //Focus on focus-element
        var $focusElement = $this.find('.init_focus').last();
        if ($focusElement.length){
            document.activeElement.blur();
            $focusElement.focus();
        }
    }

    //******************************************************
    //hide_bs_modal - called when a modal is closing
    function hide_bs_modal( /*event*/ ) {

    }

    //******************************************************
    //hidden_bs_modal - called when a modal is closed/hidden
    function hidden_bs_modal( /*event*/ ) {
        var $this = $(this);

        $this.removeClass( modalStackClassName );
        var openModals = incOpenModals( -1 );
        if (openModals){
            //Move focus to previous modal on top
            var $modal = $('.modal.show').last(),
                $nextFocus = $modal.find('.init_focus');

            if ($nextFocus.length)
                $nextFocus.focus();
            else
                $modal.focus();

            //Re-add class "modal-open" to body (it is removed by Bootstrap
            $('body').addClass('modal-open');
        }
    }

    /******************************************************
    prototype for bsModal
    ******************************************************/
    var bsModal_prototype = {

        show: function(){
            this.modal('show');
        },

        assignTo: function( $element ){
            $element.attr({
                'data-toggle': 'modal',
                'data-target': '#'+this.attr('id')
            });
        }
    };

    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.modalParts
    ******************************************************/
    $.fn._bsModalContent = function( options ){

        //addClose( $element ) - Add event/attr/data to $element to close the modal
        function addClose( $element ){
            if (options.close){
                if (options.close.onClick)
                    $element.on('click', options.close.onClick);
                if (options.close.attr)
                    $element.attr(options.close.attr);
                if (options.close.data)
                    $element.data(options.close.data);
            }
        }

        this.bsModal = {};

        var $modalContainer = this.bsModal.$container =
                $('<div/>')
                    .addClass('modal-content')
                    .appendTo( this ); 

        //Append header
        if (options.forceHeader || options.header || options.close){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        .addClass('modal-header')
                        ._bsAddHtml( options.header || $.EMPTY_TEXT )
                        .appendTo( $modalContainer );

            if (options.close){
                //Add close-button
                var $modalClose = this.bsModal.$close =
                        $('<i class="fa modal-close"/>')
                            .appendTo( $modalHeader );
                addClose( $modalClose );
            }

        }

        //Append fixed content (if any)
        var $modalFixedContent = this.bsModal.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed')
                    .appendTo( $modalContainer );
        if (options.fixedContent){
            if ($.isFunction( options.fixedContent ))
                options.fixedContent( $modalFixedContent );
            else
                $modalFixedContent.append( options.fixedContent );
        }

        //Append body and content
        var $modalBody = this.bsModal.$body =
                $('<div/>')
                    .addClass('modal-body')
                    .appendTo( $modalContainer ),

            $modalContent = this.bsModal.$content =
                options.scroll ? 
                    $modalBody.addScrollbar() :
                    $modalBody;

        //Add content
        if ($.isFunction( options.content ))
            options.content( $modalContent );
        else
            $modalContent.append( options.content );


        //Add footer
        this.bsModal.$footer =
                $('<div/>')
                    .addClass('modal-footer-header')
                    .appendTo( $modalContainer )
                    ._bsAddHtml( options.footer );
        
        //Add buttons (if any)
        var $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .appendTo( $modalContainer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],

            buttonOptions = {
                class       : '',
                addSizeClass: true,
                addOnClick  : true
            };

        //No button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        for (var i=0; i<buttons.length; i++ ){

            focusAdded = focusAdded || buttons[i].focus;
            if (!focusAdded && (i == (buttons.length-1) ) )
                buttons[i].focus = true;                

            var $button =
                $.bsButton( $.extend({}, buttonOptions, buttons[i] ) )
                    .appendTo( $modalButtonContainer );

            if (buttons[i].closeOnClick)
                addClose( $button );                

            $modalButtons.push( $button );
        }
        

/* REMOVED FOR NOW BUT PERHAPS NEEDED LATER
        //Using timeout to wait for the browser to update DOM and get max height of the content
        var count = 20;
        function testHeight(){
            var height = $modalBodyContent.height();
            if (!height){
                count--;
                if (count){
                    setTimeout( testHeight, 50 );
                    return;
                }
            }

            //Get max height of contents
            var maxContainerHeight = options.getContentHeight( $modalBodyContent ) +
                                     parseInt( $modalBodyContent.css('padding-top') ) +
                                     parseInt( $modalBodyContent.css('padding-bottom') );


            //Call post-function
            options.postGetContentHeight( $modalBodyContent );
        }

        setTimeout( testHeight, 50);
*/
//       options.postGetContentHeight( $modalBodyContent ); //Only when testHeight isn't used





        return this;
    };

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){

        var $result, $modalDialog,
            id = options.id || '_bsModal'+ modalId++,
            classNames = (window.bsIsTouch ? '' : 'fade ')+
                         (options.noVerticalPadding ? 'no-vertical-padding ' : ''),
            //Create a close-function
            closeModalFunction = function(){ $result.modal('hide'); };

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass  : 'modal',
                class      : classNames,
                //REMOVED - Only ONE size addSizeClass    : true,

                //Header
                forceHeader: true,
                close      : { onClick: closeModalFunction },

                //Content
                scroll     : true,
                content    : '',

                //Buttons
                buttons  : [],
                closeText: {da:'Luk', en:'Close'},
                closeIcon: 'fa-times',


                //Modal-options
                show       : true,

                //REMOVED getContentHeight    : default_getContentHeight,
                //REMOVED postGetContentHeight: default_postGetContentHeight

            });


        //Adding default buttons

        //Add close-botton. Avoid by setting options.closeText == ""
        if (options.closeText != '')
            options.buttons.push({
                text        : options.closeText,
                icon        : options.closeIcon,
                closeOnClick: true,
                addOnClick  : false
            });

/*
        options.buttons.push({
            text: options.okText || {da:'Ok', en:'Ok'},
            icon: options.okIcon || 'fa-check',
            primary: true,
            closeOnClick: true,
            onClick: function(){ alert('Hej :-)') },
        });
*/

        //Create the modal        
        $result = 
            $('<div/>')
                ._bsAddBaseClassAndSize( options )
                .attr({
                    'id'         : id,
                    'tabindex'   : -1,
                    'role'       : "dialog",
                    'aria-hidden': true
                });

        $modalDialog = 
            $('<div/>')
                .addClass('modal-dialog')
                .addClass(options.flex ? 'modal-flex' : '')
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.init.prototype.extend( bsModal_prototype );

        //Create modal content
        $modalDialog._bsModalContent( options );

        //Create as modal and adds methods
        $result.modal({
           //Name       Value     Type	                Default Description
           backdrop :   "static", //boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   true,     //boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,     //boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false     //boolean	            true	Shows the modal when initialized.
        });

        $result.on({
            'show.bs.modal'  : show_bs_modal,
            'shown.bs.modal' : shown_bs_modal,
            'hide.bs.modal'  : hide_bs_modal,
            'hidden.bs.modal': hidden_bs_modal,
        });


        $result.appendTo( $('body') );

        if (options.show)
            $result.show();

        return $result;
    };


    /**********************************************************


	/******************************************
	Initialize/ready
	*******************************************/
	$(function() {


	});
	//******************************************



}(jQuery, this, document));