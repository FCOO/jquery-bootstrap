/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        header
        modalContentClassName
        icons: {
            close   : {onClick, attr, className, attr, data }
            extend  : {onClick, attr, className, attr, data }
            diminish: {onClick, attr, className, attr, data }
}       type //"", "alert", "success", "warning", "error", "info"
        fixedContent

        alwaysMaxHeight
        flexWidth
        extraWidth
        megaWidth
        noVerticalPadding
        noHorizontalPadding
        content
        scroll: boolean | 'vertical' | 'horizontal'
        extended: {
            type
            fixedContent
            noVerticalPadding
            noHorizontalPadding
            alwaysMaxHeight
            content
            scroll: boolean | 'vertical' | 'horizontal'
            footer
        }
        isExtended: boolean
        footer
        buttons = [];
        closeIcon
        closeText
        noCloseIconOnHeader

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
    Sets both max-height and haight to allow always-max-heigth options
    **********************************************************/
    function adjustModalMaxHeight( $modalContent ){
        $modalContent = $modalContent || $('.modal-content.modal-flex-height');
        var maxHeight = parseInt(window.innerHeight) - 2*modalVerticalMargin;
        $modalContent.css({
            'max-height': maxHeight+'px',
            'height'    : maxHeight+'px'
        });
    }

    window.addEventListener('resize',            function(){ adjustModalMaxHeight(); }, false );
    window.addEventListener('orientationchange', function(){ adjustModalMaxHeight(); }, false );

    /******************************************************
    The height of a modal can be tre different modes
    1: max-height is adjusted to window-height. Default
    2: max-height. options.maxHeight
    3: fixed height. options.height

    The width of a modal is by default 300px.
    options.flexWidth :  If true the width of the modal will adjust to the width of the browser up to 500px
    options.extraWidth:  Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 800px
    options.megaWidth :  Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 1200px
    options.width     : Set if different from 300

    ******************************************************/
    function getHeightFromOptions( options ){
        if (options.height)    return {height   : options.height+'px',    maxHeight: null};
        if (options.maxHeight) return {maxHeight: options.maxHeight+'px', height   : 'auto'};
        return null;
    }

    function getWidthFromOptions( options ){
        return {
            flexWidth : !!options.flexWidth,
            extraWidth: !!options.extraWidth,
            megaWidth: !!options.megaWidth,
            width     : options.width ? options.width+'px' : null
        };
    }

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
        //Focus on focus-element
        var $focusElement = $(this).find('.init_focus').last();
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

        show  : function(){
                    this.modal('show');

                    this.data('bsModalDialog')._bsModalSetHeightAndWidth();

                    if (this.bsModal.onChange)
                        this.bsModal.onChange( this.bsModal );
                },
        _close: function(){ this.modal('hide'); },

        close: function(){

            //If onClose exists => call and check
            if (this.onClose && !this.onClose())
                return false;

            //If pinable and pinned => unpin
            if (this.bsModal.isPinned)
                this._bsModalUnpin();
            this._close();
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
    $.fn._bsModalBodyAndFooter = function(options, parts, className, noClassNameForFixed, noClassNameForFooter){
        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            isTabs          = !!(options && options.content && (options.content.type == 'tabs')),
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll;

        //Remove padding if the content is tabs and content isn't created from bsModal - not pretty :-)
        if (isTabs)
            className = className + ' no-vertical-padding no-horizontal-padding';

        //Append fixed content (if any)
        var $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed ' + (noClassNameForFixed ? '' : className) + (hasScroll ? ' scrollbar-'+scrollDirection : ''))
                    .appendTo( this );
        if (options.fixedContent)
            $modalFixedContent._bsAddHtml( options.fixedContent, true );

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .toggleClass('modal-body-always-max-height', !!options.alwaysMaxHeight)
                    .toggleClass('modal-type-' + options.type, !!options.type)
                    .appendTo( this );

        if (!options.content || (options.content === {}))
            $modalBody.addClass('modal-body-no-content');

        var $modalContent = parts.$content =
                hasScroll ?
                    $modalBody.addScrollbar({ direction: scrollDirection }) :
                    $modalBody;

        //Add content
        $modalContent._bsAppendContent( options.content, options.contentContext );

        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('modal-footer-header ' + (noClassNameForFooter ? '' : className))
                    .appendTo( this )
                    ._bsAddHtml( options.footer === true ? '' : options.footer );
        return this;
    };

    /******************************************************
    _bsModalSetHeightAndWidth - Set the height and width according to current cssHeight and cssWidth
    ******************************************************/
    $.fn._bsModalSetHeightAndWidth = function(){
        var bsModal = this.bsModal,
            $modalContent = bsModal.$modalContent,
            $modalDialog = $modalContent.parent(),
            isExtended = $modalContent.hasClass('modal-extended'),
            cssHeight = isExtended ? bsModal.cssExtendedHeight : bsModal.cssHeight,
            cssWidth = isExtended ? bsModal.cssExtendedWidth : bsModal.cssWidth;

        //Set height
        $modalContent
            .toggleClass('modal-fixed-height', !!cssHeight)
            .toggleClass('modal-flex-height', !cssHeight)
            .css( cssHeight ? cssHeight : {height: 'auto', maxHeight: null});
        if (!cssHeight)
            adjustModalMaxHeight( bsModal.$modalContent );

        //Set width
        $modalDialog
            .toggleClass('modal-flex-width', cssWidth.flexWidth )
            .toggleClass('modal-extra-width', cssWidth.extraWidth )
            .toggleClass('modal-mega-width', cssWidth.megaWidth )
            .css('width', cssWidth.width );

        //Call onChange (if any)
        if (bsModal.onChange)
            bsModal.onChange( bsModal );
    };

    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function( event ){
        if (this.bsModal.$modalContent.hasClass('no-modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalDiminish = function( event ){
        if (this.bsModal.$modalContent.hasClass('modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalToggleHeight = function( event ){
        this.bsModal.$modalContent.modernizrToggle('modal-extended');

        this._bsModalSetHeightAndWidth();

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };

/* TODO: animate changes in height and width
       var $this = this.bsModal.$container,
            oldHeight = $this.outerHeight(),
            newHeight;

        $this.modernizrToggle('modal-extended');

        newHeight = $this.outerHeight();
        $this.height(oldHeight);

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });
*/

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
        var $modalContent = this.bsModal.$modalContent;
        this.bsModal.isPinned = !this.bsModal.isPinned;
        $modalContent.modernizrToggle('modal-pinned', !!this.bsModal.isPinned);
        this.bsModal.onPin( this.bsModal.isPinned );

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };



    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.bsModal
    ******************************************************/
    $.fn._bsModalContent = function( options ){
        options = options || {};

        //this.bsModal contains all created elements
        this.bsModal = {};

        this.bsModal.onChange = options.onChange || null;

        //Set bsModal.cssHeight and (optional) bsModal.cssExtendedHeight
        this.bsModal.cssHeight = getHeightFromOptions( options );
        if (options.extended){
            if (options.extended.height == true)
                this.bsModal.cssExtendedHeight = this.bsModal.cssHeight;
            else
                this.bsModal.cssExtendedHeight = getHeightFromOptions( options.extended );
        }

        //Set bsModal.cssWidth and (optional) bsModal.cssExtendedWidth
        this.bsModal.cssWidth = getWidthFromOptions( options );
        if (options.extended){
            //If options.extended.width == true or none width-options is set in extended => use same width as normal-mode
            if ( (options.extended.width == true) ||
                 ( (options.extended.flexWidth == undefined) &&
                   (options.extended.extraWidth == undefined) &&
                   (options.extended.megaWidth == undefined) &&
                   (options.extended.width == undefined)
                 )
              )
                this.bsModal.cssExtendedWidth = this.bsModal.cssWidth;
            else
                this.bsModal.cssExtendedWidth = getWidthFromOptions( options.extended );
        }


        var $modalContent = this.bsModal.$modalContent =
                $('<div/>')
                    .addClass('modal-content')
                    .addClass(options.modalContentClassName)
                    .modernizrToggle('modal-extended', !!options.isExtended )

                    .toggleClass('modal-content-always-max-height',          !!options.alwaysMaxHeight)
                    .toggleClass('modal-extended-content-always-max-height', !!options.extended && !!options.extended.alwaysMaxHeight)

                    .modernizrOff('modal-pinned')
                    .appendTo( this );



        this._bsModalSetHeightAndWidth();

        var modalExtend       = $.proxy( this._bsModalExtend,       this),
            modalDiminish     = $.proxy( this._bsModalDiminish,     this),
            modalToggleHeight = $.proxy( this._bsModalToggleHeight, this),

            modalPin          = $.proxy( this._bsModalPin,          this),
            modalUnpin        = $.proxy( this._bsModalUnpin,        this);


        this.bsModal.onPin = options.onPin;
        this.bsModal.isPinned = false;

        options = $.extend( true, {
            headerClassName     : 'modal-header',
            //Buttons
            buttons             : [],
            closeButton         : true,
            closeText           : {da:'Luk', en:'Close'},
            closeIcon           : 'fa-times',
            noCloseIconOnHeader : false,

            //Icons
            icons    : {
                pin     : { className: 'hide-for-modal-pinned',   onClick: options.onPin    ? modalPin      : null },
                unpin   : { className: 'show-for-modal-pinned',   onClick: options.onPin    ? modalUnpin    : null },
                extend  : { className: 'hide-for-modal-extended', onClick: options.extended ? modalExtend   : null, altEvents:'swipeup'   },
                diminish: { className: 'show-for-modal-extended', onClick: options.extended ? modalDiminish : null, altEvents:'swipedown' },
                new     : { className: '',                        onClick: options.onNew    ? $.proxy(options.onNew, this) : null },
            }
        }, options );

        //Adjust for options.buttons: null
        options.buttons = options.buttons || [];

        //Hide the close icon on the header
        if (options.noCloseIconOnHeader && options.icons && options.icons.close)
            options.icons.close.hidden = true;

        //Add close-botton at beginning. Avoid by setting options.closeButton = false
        if (options.closeButton)
            options.buttons.unshift({
                text: options.closeText,
                icon: options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        /*
        If the modal has extended content and neither normal or extended content is tabs =>
            Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        */
        if (options.content && (options.content.type != "tabs") && options.extended && (options.extended.content.type != "tabs")){
            options.scroll = options.scroll || options.extended.scroll;
            options.extended.scroll = options.scroll;
        }

        //Append header
        if (!options.noHeader &&  (options.header || !$.isEmptyObject(options.icons) ) ){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        ._bsHeaderAndIcons( options )
                        .appendTo( $modalContent );

            //Add dbl-click on header to change to/from extended
            if (options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggleHeight );
        }
        else
            $modalContent.addClass('no-modal-header');

        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        var noClassNameForFixed = false,
            noClassNameForFooter = false;
        if (options.extended) {
            //If common fixed content => add it as normal fixed content
            if ((options.fixedContent === true) || (options.extended.fixedContent === true)) {
                noClassNameForFixed = true;
                options.fixedContent = options.extended.fixedContent === true ? options.fixedContent : options.extended.fixedContent;
                options.extended.fixedContent = '';
            }

            //If common footer content => add it as extended footer content
            if ((options.footer === true) || (options.extended.footer === true)) {
                noClassNameForFooter = true;
                options.extended.footer = options.extended.footer === true ? options.footer : options.extended.footer;
                options.footer = '';
            }
        }

        //Create normal content
        $modalContent._bsModalBodyAndFooter(options, this.bsModal, 'hide-for-modal-extended', noClassNameForFixed, false );

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};
            $modalContent._bsModalBodyAndFooter( options.extended, this.bsModal.extended, 'show-for-modal-extended', false, noClassNameForFooter );
        }

        //Add buttons (if any)
        var $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .toggleClass('modal-footer-vertical', !!options.verticalButtons)
                    .appendTo( $modalContent ),
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
        var $result, $modalDialog;

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal-dialog',
                class    : (options.noVerticalPadding   ? 'no-vertical-padding'    : '') +
                           (options.noHorizontalPadding ? ' no-horizontal-padding' : ''),

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
                .addClass('modal')
                .attr({
                    'id'         : options.id || '_bsModal'+ modalId++,
                    'tabindex'   : -1,
                    'role'       : "dialog",
                    'aria-hidden': true
                });

        $modalDialog =
            $('<div/>')
                ._bsAddBaseClassAndSize( options )
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.extend( bsModal_prototype );

        //Add close-icon and create modal content
        options.icons = { close: { onClick: $.proxy( bsModal_prototype.close, $result) } };
        $modalDialog._bsModalContent( options );
        $result.data('bsModalDialog', $modalDialog);

        $result.onClose = options.onClose;

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