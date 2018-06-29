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
}       type //"", "alert", "success", "warning", "error", "info"
        fixedContent
        flex
        noVerticalPadding
        content
        scroll: boolean | 'vertical' | 'horizontal'
        extended: {
            type
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

    **********************************************************/
    var modalId = 0,
        openModals = 0,
        modalVerticalMargin = 10; //Top and bottom margin for modal windows

    /**********************************************************
    MAX-HEIGHT ISSUES ON SAFARI (AND OTHER BROWSER ON IOS)
    Due to an intended design in Safari it is not possible to
    use style a la max-height: calc(100vh - 20px) is not working
    as expected/needed
    Instead a resize-event is added to update the max-height of
    elements with the current value of window.innerHeight
    **********************************************************/
    function adjustModalMaxHeight( $modal ){
        $modal = $modal || $('.modal');
        var $modalDialog  = $modal.find('.modal-dialog'),
            $modalContent = $modalDialog.find('.modal-content'),
            windowInnerHeight = parseInt(window.innerHeight);

        $modalDialog.css('max-height', windowInnerHeight+'px');
        $modalContent.css('max-height', (windowInnerHeight - 2*modalVerticalMargin)+'px');

    }
    window.addEventListener('resize',            function(){ adjustModalMaxHeight(); }, false );
    window.addEventListener('orientationchange', function(){ adjustModalMaxHeight(); }, false );


    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {
        //Close all popover
        $('.popover.show').popover('hide');

        var $this = $(this);

        openModals++;

        //Move up the backdrop
        $._addModalBackdropLevel();

        //Add layer for noty on the modal
        $._bsNotyAddLayer();

        //Move the modal to the front
        $this._setModalBackdropZIndex();

        //Prevent the modal from closing with esc if there are a modal noty
        $(this).keydown( function( event ){
            if (window._bsNotyModal){
                window._bsNotyModal.close();
                event.stopImmediatePropagation();
                return false;
            }
        });

    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        var $this = $(this);

        //Adjust max-height
        adjustModalMaxHeight( $this );

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
        //Never close pinned modals
        if (this.bsModal.isPinned)
            return false;

        //Remove all noty added on the modal and move down global backdrop
        $._bsNotyRemoveLayer();
    }

    //******************************************************
    //hidden_bs_modal - called when a modal is closed/hidden
    function hidden_bs_modal( /*event*/ ) {
        openModals--;
        if (openModals){
            //Move focus to previous modal on top
            var $modal = $('.modal.show').last(),
                $nextFocus = $modal.find('.init_focus');

            if ($nextFocus.length)
                $nextFocus.focus();
            else
                $modal.focus();

            //Re-add class "modal-open" to body (it is removed by Bootstrap)
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

        close: function(){
            //If pinable and pinned => unpin
            if (this.bsModal.isPinned)
                this._bsModalUnpin();
            this.modal('hide');
        },

        assignTo: function( $element ){
            $element.attr({
                'data-toggle': 'modal',
                'data-target': '#'+this.attr('id')
            });
        },

        getHeaderIcon: function(id){
            return this.find('[data-header-icon-id="'+id+'"]');
        },

        setHeaderIconEnabled: function(id, disabled){
            this.getHeaderIcon(id).toggleClass('disabled', !!disabled);
        },

        setHeaderIconDisabled: function(id){
            this.setHeaderIconEnabled(id, true);
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
                    .toggleClass('modal-type-' + options.type, !!options.type)
                    .appendTo( this ),

            $modalContent = parts.$content =
                hasScroll ?
                    $modalBody.addScrollbar({ direction: scrollDirection }) :
                    $modalBody;

        //Add content
        if ($.isFunction( options.content )){
            var contentFunc = $.proxy( options.content, options.contentContext ),
                content = contentFunc( $modalContent );
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
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function( event ){
        if (this.bsModal.$container.hasClass('no-modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalDiminish = function( event ){
        if (this.bsModal.$container.hasClass('modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalToggleHeight = function( event ){
        var $this = this.bsModal.$container,
            oldHeight = $this.outerHeight(),
            newHeight;

        $this.modernizrToggle('modal-extended');

        newHeight = $this.outerHeight();
        $this.height( oldHeight);

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };

    /******************************************************
    _bsModalPin, _bsModalUnpin, _bsModalTogglePin
    Methods to change pinned-status
    ******************************************************/
    $.fn._bsModalPin = function( event ){
        if (!this.bsModal.isPinned)
            this._bsModalTogglePin( event );
    };
    $.fn._bsModalUnpin = function( event ){
        if (this.bsModal.isPinned)
            this._bsModalTogglePin( event );
    };
    $.fn._bsModalTogglePin = function( event ){
        var $container = this.bsModal.$container;
        this.bsModal.isPinned = !this.bsModal.isPinned;
        $container.modernizrToggle('modal-pinned', !!this.bsModal.isPinned);
        this.bsModal.onPin( this.bsModal.isPinned );

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
                    .modernizrOff('modal-pinned')
                    .appendTo( this );


        var modalExtend       = $.proxy( this._bsModalExtend,       this),
            modalDiminish     = $.proxy( this._bsModalDiminish,     this),
            modalToggleHeight = $.proxy( this._bsModalToggleHeight, this),

            modalPin          = $.proxy( this._bsModalPin,          this),
            modalUnpin        = $.proxy( this._bsModalUnpin,        this);


        this.bsModal.onPin = options.onPin;
        this.bsModal.isPinned = false;

        options = $.extend( true, {
            headerClassName: 'modal-header',
            //Buttons
            buttons    : [],
            closeButton: true,
            closeText  : {da:'Luk', en:'Close'},
            closeIcon  : 'fa-times',

            //Icons
            icons    : {
                pin     : { className: 'hide-for-modal-pinned',   onClick: options.onPin    ? modalPin      : null },
                unpin   : { className: 'show-for-modal-pinned',   onClick: options.onPin    ? modalUnpin    : null },
                extend  : { className: 'hide-for-modal-extended', onClick: options.extended ? modalExtend   : null, altEvents:'swipeup'   },
                diminish: { className: 'show-for-modal-extended', onClick: options.extended ? modalDiminish : null, altEvents:'swipedown' }
            }
        }, options );

        //Adjust for options.buttons: null
        options.buttons = options.buttons || [];

        //Add close-botton at beginning. Avoid by setting options.closeButton = false
        if (options.closeButton)
            options.buttons.unshift({
                text: options.closeText,
                icon: options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        //If the modal has extended content: Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        if (options.extended){
            options.scroll = options.scroll || options.extended.scroll;
            options.extended.scroll = options.scroll;
        }

        //Append header
        if (!options.noHeader &&  (options.header || !$.isEmptyObject(options.icons) ) ){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        ._bsHeaderAndIcons( options )
                        .appendTo( $modalContainer );

            //Add dbl-click on header to change to/from extended
            if (options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggleHeight );
        }
        else
            $modalContainer.addClass('no-modal-header');

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
        return this;
    };

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){
        var $result, $modalDialog,
            id = options.id || '_bsModal'+ modalId++,
            classNames = (options.noVerticalPadding   ? 'no-vertical-padding'    : '') +
                         (options.noHorizontalPadding ? ' no-horizontal-padding' : '');

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal',
                class    : classNames,

                //Header
                noHeader : false,

                //Size
                useTouchSize: true,

                //Content
                scroll     : true,
                content    : '',

                //Modal-options
                static     : false,
                show       : true
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
                .addClass(options.flex && options.extraWidth ? 'extra-width' : '')
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.extend( bsModal_prototype );

        //Add close-icon and create modal content
        options.icons = { close: { onClick: $.proxy( bsModal_prototype.close, $result) } };
        $modalDialog._bsModalContent( options );
        $result.data('bsModalDialog', $modalDialog);

        //Create as modal and adds methods
        $result.modal({
           //Name       Value                                   Type                Default Description
           backdrop :   options.static ? "static" : true,   //  boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   true,                               //  boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,                               //  boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false                               //  boolean	            true	Shows the modal when initialized.
        });
        $result.bsModal = $modalDialog.bsModal;
        $result.on({
            'show.bs.modal'  : show_bs_modal,
            'shown.bs.modal' : shown_bs_modal,
            'hide.bs.modal'  : $.proxy(hide_bs_modal, $result),
            'hidden.bs.modal': hidden_bs_modal,
        });

        $result.appendTo( $('body') );

        if (options.show)
            $result.show();

        return $result;
    };

}(jQuery, this, document));