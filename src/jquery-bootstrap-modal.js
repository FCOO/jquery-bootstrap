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
        icons: {
            close   : {onClick, attr, className, attr, data }
            extend  : {onClick, attr, className, attr, data }
            diminish: {onClick, attr, className, attr, data }
}
        fixedContent
        flex
        noVerticalPadding
        content
        scroll: boolean | 'vertical' | 'horizontal'
        extended: {
            fixedContent
            flex
            noVerticalPadding
            content
            scroll: boolean | 'vertical' | 'horizontal'
            footer
        }
        isExtended: boolean
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

        //Close all popover
        $('.popover.show').popover('hide');

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
    _bsModalBodyAndFooter
    Create the body and footer content (exc header and bottoms) 
    of a modal inside this. Created elements are saved in parts
    ******************************************************/
    $.fn._bsModalBodyAndFooter = function(options, parts, className){
        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll;

        //Append fixed content (if any)
        var $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed ' + className + (hasScroll ? ' scrollbar-'+scrollDirection : ''))
                    .appendTo( this );
        if (options.fixedContent){
            if ($.isFunction( options.fixedContent ))
                options.fixedContent( $modalFixedContent );
            else
                $modalFixedContent.append( options.fixedContent );
        }

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .appendTo( this ),

            $modalContent = parts.$content =
                hasScroll ?
                    $modalBody.addScrollbar({ direction: scrollDirection }) :
                    $modalBody;

        //Add content
        if ($.isFunction( options.content )){
            var contentFunc = $.proxy( options.content, options.contentContext );

            //Both support functions creating content on container and  functions returning content
//            var content = options.content( $modalContent );
            var content = contentFunc( $modalContent );
            if (content)
                $modalContent.append( content );
        }
        else
            $modalContent.append( options.content );


        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('modal-footer-header ' + className)
                    .appendTo( this )
                    ._bsAddHtml( options.footer );
        return this;
    };
    
    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggle
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function( event ){
        if (this.hasClass('no-modal-extended'))
            this._bsModalToggle( event );
    };        
    $.fn._bsModalDiminish = function( event ){
        if (this.hasClass('modal-extended'))
            this._bsModalToggle( event );
    };        

    
    $.fn._bsModalToggle = function( event ){
        var $this = $(this),
            oldHeight = $this.outerHeight(),
            newHeight;
        
        this.modernizrToggle('modal-extended');

        newHeight = $this.outerHeight();
        $this.height( oldHeight); 

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };

    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.modalParts
    ******************************************************/
    $.fn._bsModalContent = function( options ){
        options = options || {};

        
        //this.bsModal contains all created elements
        this.bsModal = {};

        var $modalContainer = this.bsModal.$container =
                $('<div/>')
                    .addClass('modal-content') 
                    .modernizrToggle('modal-extended', !!options.isExtended )
                    .appendTo( this );


        var modalExtend   = $.proxy( $modalContainer._bsModalExtend,   $modalContainer ),
            modalDiminish = $.proxy( $modalContainer._bsModalDiminish, $modalContainer ),
            modalToggle   = $.proxy( $modalContainer._bsModalToggle,   $modalContainer );
        
        options = $.extend( true, {
            //Buttons
            buttons    : [],
            closeButton: true,
            closeText  : {da:'Luk', en:'Close'},
            closeIcon  : 'fa-times',

            //Icons
            icons    : {
                extend  : { className: 'hide-for-modal-extended', altEvents:'swipeup',   onClick: options.extended ? modalExtend   : null },
                diminish: { className: 'show-for-modal-extended', altEvents:'swipedown', onClick: options.extended ? modalDiminish : null }
            }
        }, options );

        //Add close-botton. Avoid by setting options.closeButton  = false
        if (options.closeButton)
            options.buttons.push({
                text        : options.closeText,
                icon        : options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        //If the modal has extended content: Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        if (options.extended){
            options.scroll = options.scroll || options.extended.scroll;            
            options.extended.scroll = options.scroll;            
        }
        
        //Determinate if there are any icons
        var inclIcons = false;
        $.each( options.icons, function( id, iconOptions ){
            inclIcons = inclIcons || (iconOptions !== null);
        });

        //Append header
        if (!options.noHeader &&  (options.header || inclIcons)){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        .addClass('modal-header')
                        ._bsAddHtml( options.header || $.EMPTY_TEXT )
                        .appendTo( $modalContainer );

            //Add dbl-click on header to change to/from extended
            if (options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggle );

            if (inclIcons){
                //Container for icons
                var $iconContainer =
                        $('<div/>')
                            ._bsAddBaseClassAndSize( {
                                baseClass   :'modal-header-icon-container',
                                useTouchSize: true
                            })
                            .appendTo( $modalHeader );

                //Add icons
                $.each( ['diminish', 'extend', 'close'], function( index, id ){
                    var iconOptions = options.icons[id];
                    if (iconOptions && iconOptions.onClick){
                        $('<i/>')
                            .addClass('modal-icon modal-icon-' + id )
                            .addClass( iconOptions.className || '')
                            .on('click', iconOptions.onClick)
                            .attr( iconOptions.attr || {})
                            .data( iconOptions.data || {})
                            .appendTo($iconContainer);

                        //Add alternative (swipe) event
                        if (iconOptions.altEvents)
                            $modalHeader.on( iconOptions.altEvents, iconOptions.onClick );
                    }
                });
            }
        }
        
        //Create normal content
        $modalContainer._bsModalBodyAndFooter( options, this.bsModal, 'hide-for-modal-extended' );

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};            
            $modalContainer._bsModalBodyAndFooter( options.extended, this.bsModal.extended, 'show-for-modal-extended' );
        }
      
        //Add buttons (if any)
        var $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .toggleClass('modal-footer-vertical', !!options.verticalButtons)
                    .appendTo( $modalContainer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonClass = options.verticalButtons ? 'btn-block' : '',
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //If no button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        $.each( buttons, function( index, buttonOptions ){

            focusAdded = focusAdded || buttonOptions.focus;
            if (!focusAdded && (index+1 == buttons.length ) )
                buttonOptions.focus = true;

            //Add same onClick as close-icon if closeOnClick: true
            if (buttonOptions.closeOnClick)
                buttonOptions.equalIconId = (buttonOptions.equalIconId || '') + ' close';                    
            
            buttonOptions.class = defaultButtonClass + ' ' + (buttonOptions.className || '');
            
            var $button =
                $.bsButton( $.extend({}, defaultButtonOptions, buttonOptions ) )
                    .appendTo( $modalButtonContainer );
        
            //Add onClick from icons (if any)
            buttonOptions.equalIconId = buttonOptions.equalIconId || '';
            $.each( buttonOptions.equalIconId.split(' '), function( index, iconId ){
                if (iconId && options.icons[iconId] && options.icons[iconId].onClick)
                    $button.on('click', options.icons[iconId].onClick);                    
            });

            $modalButtons.push( $button );
        });


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
            classNames = options.noVerticalPadding ? 'no-vertical-padding' : '',
            //Create a close-function
            closeModalFunction = function(){ $result.modal('hide'); };

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal',
                class    : classNames,

                //Header
                noHeader : false,

                //Icons
                icons    : {
                    close   : { onClick: closeModalFunction }
                },

                //Content
                scroll     : true,
                content    : '',

                //Modal-options
                show       : true,

                //REMOVED getContentHeight    : default_getContentHeight,
                //REMOVED postGetContentHeight: default_postGetContentHeight

            });


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