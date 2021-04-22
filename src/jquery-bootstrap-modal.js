/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    //Adjusting default options and methods for jquery-scroll-container
    $.extend(window.JqueryScrollContainer.scrollbarOptions, {
        defaultScrollbarOnTouch: false,

        //If touch-mode AND scrollbar-width > 0 => let jquery-scroll-container auto-adjust padding-right
        adjustPadding : function(){ return window.bsIsTouch && window.getScrollbarWidth() ? 'scroll' : 'none'; },

        hasTouchEvents: function(){ return window.bsIsTouch; }
    });


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
        noShadow
        content
        scroll: boolean | 'vertical' | 'horizontal'
        minimized,
        extended: {
            type
            showHeaderOnClick (only minimized)
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
        historyList         - The modal gets backward and forward icons in header to go backward and forward in the historyList. See demo and https://github.com/fcoo/history.js

    **********************************************************/
    var modalId = 0,
        openModals = 0,
        modalVerticalMargin = 10, //Top and bottom margin for modal windows

        //Const to set different size of modal-window
        MODAL_SIZE_NORMAL    = 1, //'normal',
        MODAL_SIZE_MINIMIZED = 2, //'minimized',
        MODAL_SIZE_EXTENDED  = 4, //'extended';

        modalSizeName = {};
        modalSizeName[MODAL_SIZE_NORMAL   ] = 'normal';
        modalSizeName[MODAL_SIZE_MINIMIZED] = 'minimized';
        modalSizeName[MODAL_SIZE_EXTENDED ] = 'extended';

    /**********************************************************
    MAX-HEIGHT ISSUES ON SAFARI (AND OTHER BROWSER ON IOS)
    Due to an intended design in Safari it is not possible to
    use style a la max-height: calc(100vh - 20px) is not working
    as expected/needed
    Instead a resize-event is added to update the max-height of
    elements with the current value of window.innerHeight
    Sets both max-height and height to allow always-max-heigth options
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
            megaWidth : !!options.megaWidth,
            width     : options.width ? options.width+'px' : null
        };
    }

    /******************************************************
    $._bsModal_closeMethods = [] of {selector[STRING], method[FUNCTION($this)]}
    List of selector and method-name to be found and called to close
    elements with some sort of 'opened' part (eg. select-box)
    These elements are closed when the modal contents is scrolled and
    when the modal is closed
    ******************************************************/
    $._bsModal_closeMethods = $._bsModal_closeMethods || [];

    $.fn._bsModalCloseElements = function(){
        var _this = this;
        //'Close' alle elements (eg. select-box)
        $.each($._bsModal_closeMethods, function(index, options){
            _this.find(options.selector).each(function(){
                options.method($(this));
            });
        });
    };

    var currentModal = null;
    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {
        //Close all popover
        $('.popover.show').popover('hide');


        //Close elements
        if (currentModal)
            currentModal._bsModalCloseElements();


        openModals++;
        this.previousModal = currentModal;
        currentModal = this;

        //Move up the backdrop
        $._addModalBackdropLevel();

        //Add layer for noty on the modal
        $._bsNotyAddLayer();

        //Move the modal to the front
        this._setModalBackdropZIndex();

        //Prevent the modal from closing with esc if there are a modal noty
        this.keydown( function( event ){
            if (window._bsNotyModal){
                window._bsNotyModal.close();
                event.stopImmediatePropagation();
                return false;
            }
        });

        if (this.onShow)
            this.onShow(this);
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
    function hide_bs_modal() {
        currentModal = this.previousModal;

        //Close elements
        this._bsModalCloseElements();

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

    function _updateFixedAndFooterInOptions( options ){
        //Adjust options if footer: true or extendedContent: true
        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        if (options.extended) {
            //If common fixed content => add it as normal fixed content
            if ((options.fixedContent === true) || (options.extended.fixedContent === true)) {
                options.fixedContent = options.fixedContent === true ? options.extended.fixedContent : options.fixedContent;
                options.extended.fixedContent = options.extended.fixedContent === true ? options.fixedContent : options.extended.fixedContent;
            }

            //If common footer content => add it as extended footer content
            if ((options.footer === true) || (options.extended.footer === true)) {
                options.footer = options.footer === true ? options.extended.footer : options.footer;
                options.extended.footer = options.extended.footer === true ? options.footer : options.extended.footer;
            }
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

        _close: function(){
            this.modal('hide');
        },

        close: function(){
            //Close elements
            this._bsModalCloseElements();

            //If onClose exists => call and check
            if (this.onClose && !this.onClose(this))
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
        },


        /******************************************************
        update
        Empty and replace the content of the header, content, fixed-content, footer and
        extended-content, extended-fixed-content, extended-footer and
        minimized-content, minimized-fixed-content, minimized-footer
        Note:
        The type of content must have been difined in the original modal-options.
        Meaning that no new type can be added
        ******************************************************/
        update: function( options ){
            var _this = this;
            //***********************************************************
            function updateElement($element, newOptions, methodName, param ){
                if ($element && newOptions){
                    $element.empty();
                    $element[methodName](newOptions, param);
                }
            }
            //***********************************************************

            //Update header
            var $iconContainer = this.bsModal.$header.find('.header-icon-container').detach();
            updateElement(this.bsModal.$header, options, '_bsHeaderAndIcons');
            this.bsModal.$header.append($iconContainer);

            _updateFixedAndFooterInOptions(options);

            //Update the tree size-contents
            $.each([null, 'minimized', 'extended'], function(index, id){
                var containers     = id ? _this.bsModal[id] : _this.bsModal,
                    contentOptions = id ? options[id]       : options;

                if (containers && contentOptions){
                    updateElement(containers.$fixedContent, contentOptions.fixedContent, '_bsAppendContent', contentOptions.fixedContentContext );
                    updateElement(containers.$content,      contentOptions.content,      '_bsAppendContent', contentOptions.contentContext );
                    updateElement(containers.$footer,       contentOptions.footer,       '_bsAddHtml' );
                }
            });
            return this;
        },

        //Methods used by $.BsModalContentPromise
        _bsModalPromise_Update: function(options){
            this.update(options);
        },
        _bsModalPromise_Reject: function(){
            this.close();
        }
    };

    /******************************************************
    _bsModalBodyAndFooter
    Create the body and footer content (exc header and bottoms)
    of a modal inside this. Created elements are saved in parts
    ******************************************************/
    $.fn._bsModalBodyAndFooter = function(size, options, parts, className, initSize){

        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            isTabs          = !!(options && options.content && (options.content.type == 'tabs')),
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll,
            scrollbarClass  = hasScroll ? 'scrollbar-'+scrollDirection : '';

        className = (className || '') + ' show-for-modal-'+modalSizeName[size];

        //Remove padding if the content is tabs and content isn't created from bsModal - not pretty :-)
        if (isTabs){
            options.noVerticalPadding = true;
            options.noHorizontalPadding = true;
        }

        //Append fixed content (if any)
        //options.fixedContentOptions = options different from content for fixed-content
        var fixedOptions = $.extend({}, options, options.fixedContentOptions || {}),
            $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed')
                    .addClass(className || '')
                    .addClass(scrollbarClass )
                    .toggleClass('no-vertical-padding',         !!fixedOptions.noVerticalPadding)
                    .toggleClass('no-horizontal-padding',       !!fixedOptions.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent', !!fixedOptions.semiTransparent)
                    .toggleClass('modal-type-' + options.type,  !!fixedOptions.type)
                    .addClass(options.fixedClassName || '')
                    .appendTo( this );

        if (options.fixedContent)
            $modalFixedContent._bsAppendContent( options.fixedContent, options.fixedContentContext );

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .toggleClass('modal-body-always-max-height', !!options.alwaysMaxHeight)
                    .toggleClass('no-vertical-padding',          !!options.noVerticalPadding)
                    .toggleClass('no-horizontal-padding',        !!options.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent',  !!options.semiTransparent)
                    .toggleClass('modal-type-' + options.type,   !!options.type)
                    .addClass(options.className || '')
                    .appendTo( this );

        if (!options.content || (options.content === {}))
            $modalBody.addClass('modal-body-no-content');


        var $modalContent = parts.$content =
                hasScroll ?
                    $modalBody
                        .addClass(scrollbarClass)
                        .addScrollbar({
                            direction       : scrollDirection,
                            contentClassName: options.noVerticalPadding ? '' : 'modal-body-with-vertical-padding'
                        }) :
                    $modalBody;

        //Add content. If the content is 'dynamic' ie options.dynamic == true and options.content is a function, AND it is a different size => save function
        if (options.dynamic && (typeof options.content == 'function') && (size != initSize)){
            parts.dynamicContent        = options.content;
            parts.dynamicContentContext = options.contentContext;
        }
        else
            $modalContent._bsAppendContent( options.content, options.contentContext );

        //Add scroll-event to close any bootstrapopen -select
        if (hasScroll)
            $modalBody.on('scroll', function(){
                //Close all elements when scrolling
                $(this).parents('.modal').first()._bsModalCloseElements();
            });

        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('modal-footer-header ' + className)
                    .appendTo( this )
                    ._bsAddHtml( options.footer );

        //Add onClick to all elements - if nedded
        if (options.onClick){
            this.addClass('modal-' + modalSizeName[size] + '-clickable');
            if (options.fixedContent)
                $modalFixedContent.on('click', options.onClick);

            $modalContent.on('click', options.onClick);
        }
        return this;
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

        //bsModal.cssHeight and bsModal.cssWidth = [size] of { width or height options}
        this.bsModal.cssHeight = {};
        this.bsModal.cssWidth  = {};
        this.bsModal.sizes = MODAL_SIZE_NORMAL;

        //Set bsModal.cssHeight
        this.bsModal.cssHeight[MODAL_SIZE_NORMAL] = getHeightFromOptions( options );

        if (options.minimized){
            this.bsModal.sizes += MODAL_SIZE_MINIMIZED;
            this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED] = getHeightFromOptions(options.minimized);
        }

        if (options.extended){
            this.bsModal.sizes += MODAL_SIZE_EXTENDED;
            if (options.extended.height == true)
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = this.bsModal.cssHeight[MODAL_SIZE_NORMAL];
            else
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = getHeightFromOptions( options.extended );
        }

        //Set bsModal.cssWidth
        this.bsModal.cssWidth[MODAL_SIZE_NORMAL] = getWidthFromOptions( options );

        if (options.minimized)
            this.bsModal.cssWidth[MODAL_SIZE_MINIMIZED] = getWidthFromOptions(options.minimized);

        if (options.extended){
            //If options.extended.width == true or none width-options is set in extended => use same width as normal-mode
            if ( (options.extended.width == true) ||
                 ( (options.extended.flexWidth == undefined) &&
                   (options.extended.extraWidth == undefined) &&
                   (options.extended.megaWidth == undefined) &&
                   (options.extended.width == undefined)
                 )
              )
                this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = this.bsModal.cssWidth[MODAL_SIZE_NORMAL];
            else
                this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = getWidthFromOptions( options.extended );
        }

        var $modalContent = this.bsModal.$modalContent =
                $('<div/>')
                    .addClass('modal-content')
                    .addClass(options.modalContentClassName)
                    .toggleClass('no-shadow', !!options.noShadow)
                    .modernizrOff('modal-pinned')
                    .appendTo( this );

        //Set modal-[SIZE]-[STATE] class
        function setStateClass(postClassName, optionId){
            $modalContent
                .toggleClass('modal-minimized-'+postClassName, !!options.minimized && !!options.minimized[optionId])
                .toggleClass('modal-normal-'+postClassName,    !!options[optionId])
                .toggleClass('modal-extended-'+postClassName,  !!options.extended && !!options.extended[optionId]);
        }
        //Add class to make content always max-height
        setStateClass('always-max-height', 'alwaysMaxHeight');
        //Add class to make content clickable
        setStateClass('clickable', 'clickable');
        //Add class to make content semi-transparent
        setStateClass('semi-transparent', 'semiTransparent');

        var initSize =  options.minimized && options.isMinimized ?
                            MODAL_SIZE_MINIMIZED :
                        options.extended && options.isExtended ?
                            MODAL_SIZE_EXTENDED :
                            MODAL_SIZE_NORMAL;

        this._bsModalSetSizeClass(initSize);
        this._bsModalSetHeightAndWidth();

        var modalExtend       = $.proxy( this._bsModalExtend,       this),
            modalDiminish     = $.proxy( this._bsModalDiminish,     this),
            modalToggleHeight = $.proxy( this._bsModalToggleHeight, this),
            modalPin          = $.proxy( this._bsModalPin,          this),
            modalUnpin        = $.proxy( this._bsModalUnpin,        this),
            iconExtendClassName   = '',
            iconDiminishClassName = '',
            multiSize = this.bsModal.sizes > MODAL_SIZE_NORMAL;

        //If multi size: Set the class-name for the extend and diminish icons.
        if (multiSize){
            iconExtendClassName   = this.bsModal.sizes & MODAL_SIZE_EXTENDED  ? 'hide-for-modal-extended'  : 'hide-for-modal-normal';
            iconDiminishClassName = this.bsModal.sizes & MODAL_SIZE_MINIMIZED ? 'hide-for-modal-minimized' : 'hide-for-modal-normal';
        }

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
                pin     : { className: 'hide-for-modal-pinned', onClick: options.onPin ? modalPin      : null },
                unpin   : { className: 'show-for-modal-pinned', onClick: options.onPin ? modalUnpin    : null },
                extend  : { className: iconExtendClassName,     onClick: multiSize ? modalExtend   : null, altEvents:'swipeup'   },
                diminish: { className: iconDiminishClassName,   onClick: multiSize ? modalDiminish : null, altEvents:'swipedown' },
                new     : { className: '',                      onClick: options.onNew ? $.proxy(options.onNew, this) : null },
                info    : { className: '',                      onClick: options.onInfo ? $.proxy(options.onInfo, this) : null },
                warning : { className: '',                      onClick: options.onWarning ? $.proxy(options.onWarning, this) : null },
                help    : { className: '',                      onClick: options.onHelp ? $.proxy(options.onHelp, this) : null },
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
            if (options.minimized || options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggleHeight );
        }

        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        _updateFixedAndFooterInOptions(options);

        //Create minimized content
        if (options.minimized){
            this.bsModal.minimized = {};
                $modalContent.addClass('modal-minimized-hide-header');
                var bsModalToggleMinimizedHeader = $.proxy(this._bsModalToggleMinimizedHeader, this);
                options.minimized.onClick =
                    options.minimized.showHeaderOnClick ?
                        bsModalToggleMinimizedHeader :
                        modalExtend;

            //Close header when a icon is clicked
            if (options.minimized.showHeaderOnClick)
                this.bsModal.$header.on('click', bsModalToggleMinimizedHeader);

            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_MINIMIZED/*'minimized'*/, options.minimized, this.bsModal.minimized, '', initSize );

            if (options.minimized.showHeaderOnClick){
                //Using fixed-height as height of content
                var cssHeight = this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED];
                if (cssHeight && cssHeight.height)
                    this.bsModal.minimized.$content.height(cssHeight.height);

                this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED] = null;
            }
        }

        //Create normal content
        if (options.clickable && !options.onClick)
            //Set default on-click
            options.onClick =
                options.extended ?
                    modalExtend :
                options.minimized ?
                    modalDiminish :
                    null;

        $modalContent._bsModalBodyAndFooter(MODAL_SIZE_NORMAL/*'normal'*/, options, this.bsModal, '', initSize);

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};
            if (options.extended.clickable)
                options.extended.onClick = options.extended.onClick || modalDiminish;
            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_EXTENDED/*'extended'*/, options.extended, this.bsModal.extended, '', initSize);
        }

        //Add buttons (if any). Allways hidden for minimized. Need to add outer-div ($outer) to avoid
        //that $modalButtonContainer is direct children since show-for-modal-XX overwrite direct children display: flex with display: initial
        var $outer = $('<div/>').appendTo( $modalContent ),
            $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .toggleClass('modal-footer-vertical', !!options.verticalButtons)
                    .appendTo( $outer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonClass = options.verticalButtons ? 'btn-block' : '',
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //If extende-content and extended.buttons = false => no buttons in extended
        if (options.extended && (options.extended.buttons === false))
            $modalButtonContainer.addClass('show-for-modal-normal');
        else
            $modalButtonContainer.addClass('show-for-no-modal-minimized');

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
    *******************************************************
    Set/change size-mode
    *******************************************************
    ******************************************************/
    function get$modalContent( $elem ){
        var bsModal = $elem.bsModal || $elem;
        return bsModal.$modalContent || $elem;
    }

    /******************************************************
    _bsModalSetSizeClass(size) - Set the class-name according to size
    ******************************************************/
    $.fn._bsModalSetSizeClass = function(size){
        return get$modalContent(this)
                   .modernizrToggle('modal-minimized', size == MODAL_SIZE_MINIMIZED )
                   .modernizrToggle('modal-normal',    size == MODAL_SIZE_NORMAL)
                   .modernizrToggle('modal-extended',  size == MODAL_SIZE_EXTENDED );
    };

    $.fn._bsModalGetSize = function(){
        var $modalContent = get$modalContent(this);
        return $modalContent.hasClass('modal-minimized') ?
                   MODAL_SIZE_MINIMIZED :
               $modalContent.hasClass('modal-normal') ?
                   MODAL_SIZE_NORMAL :
                   MODAL_SIZE_EXTENDED;
    };

    /******************************************************
    _bsModalSetHeightAndWidth - Set the height and width according to current cssHeight and cssWidth
    ******************************************************/
    $.fn._bsModalSetHeightAndWidth = function(){
        var bsModal = this.bsModal,
            $modalContent = get$modalContent(this),
            $modalDialog = $modalContent.parent(),
            size = $modalContent._bsModalGetSize(),
            cssHeight = bsModal.cssHeight[size],
            cssWidth = bsModal.cssWidth[size];

        //Set height
        $modalContent
            .toggleClass('modal-fixed-height', !!cssHeight)
            .toggleClass('modal-flex-height', !cssHeight)
            .css( cssHeight ? cssHeight : {height: 'auto', maxHeight: null});
        if (!cssHeight)
            adjustModalMaxHeight( $modalContent );

        //Set width
        $modalDialog
            .toggleClass('modal-flex-width', cssWidth.flexWidth )
            .toggleClass('modal-extra-width', cssWidth.extraWidth )
            .toggleClass('modal-mega-width', cssWidth.megaWidth )
            .css('width', cssWidth.width ? cssWidth.width : '' );

        //Call onChange (if any)
        if (bsModal.onChange)
            bsModal.onChange( bsModal );
    };

    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight,
    _bsModalSetSize, _bsModalToggleMinimizedHeader
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function(){
        return this._bsModalSetSize( this._bsModalGetSize() == MODAL_SIZE_MINIMIZED ? MODAL_SIZE_NORMAL : MODAL_SIZE_EXTENDED);
    };

    $.fn._bsModalDiminish = function(){
        return this._bsModalSetSize( this._bsModalGetSize() == MODAL_SIZE_EXTENDED ? MODAL_SIZE_NORMAL : MODAL_SIZE_MINIMIZED);
    };

    //Shift between normal and extended size
    //minimized -> normal, extended -> normal, normal -> extended (if any) else -> minimized
    $.fn._bsModalToggleHeight = function(){
        var newSize = this._bsModalGetSize() == MODAL_SIZE_NORMAL ?
                        (this.bsModal.sizes & MODAL_SIZE_EXTENDED ? MODAL_SIZE_EXTENDED : MODAL_SIZE_MINIMIZED) :
                        MODAL_SIZE_NORMAL;
        this._bsModalSetSize(newSize);
    };

    //Set new size of modal-window
    $.fn._bsModalSetSize = function(size){
        //Check to see if the content of the new size need to be created dynamically
        var parts = this.bsModal[ modalSizeName[size] ] || this.bsModal;

        if (parts && parts.dynamicContent){
            parts.$content._bsAppendContent( parts.dynamicContent, parts.dynamicContentContext );

            parts.dynamicContent        = null;
            parts.dynamicContentContext = null;
        }

        this._bsModalSetSizeClass(size);
        this._bsModalSetHeightAndWidth();


        /*
        NOTE: 2021-04-16
        Original this methods returns false to prevent onclick-event on the header.
        That prevented other more general events to be fired. Eg. in fcoo/leaflet-bootstrap
        where the focus of a popup window was set when the window was clicked
        It appear not to have any other effect when removed.
        */
        //return false; //Prevent onclick-event on header
    };

    //hid/show header for size = minimized
    $.fn._bsModalToggleMinimizedHeader = function(){
        if (this._bsModalGetSize() == MODAL_SIZE_MINIMIZED)
            get$modalContent(this).toggleClass('modal-minimized-hide-header');
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
    $.fn._bsModalPin = function(){
        return this.bsModal.isPinned ? false : this._bsModalTogglePin();
    };
    $.fn._bsModalUnpin = function( /*event*/ ){
        return this.bsModal.isPinned ? this._bsModalTogglePin() : false;
    };
    $.fn._bsModalTogglePin = function( /*event*/ ){
        var $modalContent = this.bsModal.$modalContent;
        this.bsModal.isPinned = !this.bsModal.isPinned;
        $modalContent.modernizrToggle('modal-pinned', !!this.bsModal.isPinned);

        return this.bsModal.onPin( this.bsModal.isPinned );
    };



    //bsModal_updateIcons_historylist - Updates backward- and forward-icons in modal-header according to status of historyList
    function bsModal_updateIcons_historylist( backAvail, forwardAvail, historyList ){
        if (historyList.lastIndex <= 0) return;

        //Show icons
        this.getHeaderIcon('back').css('visibility', 'initial');
        this.getHeaderIcon('forward').css('visibility', 'initial');

        //Update icons
        this.setHeaderIconEnabled('back'   , !backAvail );
        this.setHeaderIconEnabled('forward', !forwardAvail );
    }

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){
        var $result, $modalDialog;
        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal-dialog',

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
        options.icons = options.icons || {};
        options.icons.close = { onClick: $.proxy( bsModal_prototype.close, $result) };

        //Add backward- and forward-icons and update-function if modal is connected to a historyList
        if (options.historyList){
            options.icons.back    = {onClick: function(){ options.historyList.goBack();    }};
            options.icons.forward = {onClick: function(){ options.historyList.goForward(); }};

            options.historyList.options.onUpdate = $.proxy( bsModal_updateIcons_historylist, $result );
        }

        //Create modal content
        $modalDialog._bsModalContent( options );
        $result.data('bsModalDialog', $modalDialog);

        $result.onShow = options.onShow;
        $result.onClose = options.onClose;

        //Create as modal and adds methods - only allow close by esc for non-static modal (typical a non-form)
        $result.modal({
           //Name       Value                                   Type                Default Description
           backdrop :   options.static ? "static" : true,   //  boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   !options.static,                    //  boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,                               //  boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false                               //  boolean	            true	Shows the modal when initialized.
        });
        $result.bsModal = $modalDialog.bsModal;

        if (options.historyList){
            //Hide back- and forward-icons
            $result.getHeaderIcon('back').css('visibility', 'hidden');
            $result.getHeaderIcon('forward').css('visibility', 'hidden');
        }

        $result.on({
            'show.bs.modal'  : $.proxy(show_bs_modal, $result),//show_bs_modal,
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