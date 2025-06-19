/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, bootstrap, window, document, undefined) {
	"use strict";

    //Adjusting default options jquery-scroll-container
    window.JqueryScrollContainer.scrollbarOptions.paddingLeft = true;
    window.JqueryScrollContainer.update(window.bsIsTouch);

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

        //The height of the modal can be one of the following four ways:
        height   : NUMBER - The fixed height

        maxHeight: NUMBER - The max height

        relativeHeight       : NUMBER of FUNCTION. Must be/return a number <= 1 witch is the relative height compared with the parent container of the modal. Default = 1
        relativeHeightOffset : NUMBER or FUNCTION. Must be/return a number the is deducted from parent-container-height * relativeHeight. Default = 2 * modalVerticalMargin
        parentContainerHeight: NUMBER or FUNCTION. Is/return the height of the parent container. Default = window.innerHeight

        alwaysMaxHeight: BOOLEAN - If true the modal is always the full height of it parent

        allowFullScreen: BOOLEAN - if true the largest size (normal or extended) gets the possibility to be displayed in full-screen
        noReopenFullScreen: BOOLEAN - if false and allowFullScreen = true and the modal was in full-screen when closed => It will reopen in full-screen. If true the modal will reopen in prevoius size (minimized, normal or extended)

        innerHeight     : The fixed height of the content
        innerMaxHeight  : The fixed max-height of the content

        fitWidth
        flexWidth
        extraWidth
        megaWidth
        fullScreen
        noVerticalPadding
        noHorizontalPadding
        noShadow
        small: BOOLEAN if true the content gets extra small
        smallButtons: BOOLEAN If true the modal gents extra small buttons
        content
        verticalButtons: BOOLEAN, default = false, if true the buttons are vertical stacked and has width = 100%
        scroll: boolean | 'vertical' | 'horizontal'
        minimized,
        extended: {
            type
            showHeader (only minimized) if true the header is also shown in minimized-mode
            showHeaderOnClick (only minimized)
            fixedContent, fixed: content or true. If true the content is equal to normal or extended/minimized
            noVerticalPadding
            noHorizontalPadding
            alwaysMaxHeight
            innerHeight
            innerMaxHeight
            content
            verticalButtons: BOOLEAN, default = options.verticalButtons, if true the buttons are vertical stacked and has width = 100%. If false and options.verticalButtons = true only normal gets vertival buttons
            scroll: boolean | 'vertical' | 'horizontal'
            footer: content or true. If true the content is equal to normal or extended/minimized
        }
        isExtended: boolean
        footer
        buttons = [];
        closeIcon
        closeText
        noCloseIconOnHeader
        historyList         - The modal gets backward and forward icons in header to go backward and forward in the historyList. See demo and https://github.com/fcoo/history.js

        keepScrollWhenReopen: false, - if true the scrolling of the content is reused. If false all content starts at scroll 0,0 when shown



    **********************************************************/
    var modalId = 0,
        openModals = 0,
        modalVerticalMargin = 10, //Top and bottom margin for modal windows

        //Const to set different size of modal-window
        MODAL_SIZE_NORMAL    = $.MODAL_SIZE_NORMAL    = 1, //'normal',
        MODAL_SIZE_MINIMIZED = $.MODAL_SIZE_MINIMIZED = 2, //'minimized',
        MODAL_SIZE_EXTENDED  = $.MODAL_SIZE_EXTENDED  = 4, //'extended';

        modalSizeName = {};
        modalSizeName[MODAL_SIZE_NORMAL   ] = 'normal';
        modalSizeName[MODAL_SIZE_MINIMIZED] = 'minimized';
        modalSizeName[MODAL_SIZE_EXTENDED ] = 'extended';

    var modalSizeClassName = {};
        modalSizeClassName[MODAL_SIZE_NORMAL]    = 'modal-normal';
        modalSizeClassName[MODAL_SIZE_MINIMIZED] = 'modal-minimized';
        modalSizeClassName[MODAL_SIZE_EXTENDED]  = 'modal-extended';




    /**********************************************************
    CHANGE MODAL OPTIONS
    In some cases an application need to adjust the default modal-options
    given by an external packages. Eg. on mobil devices - it is better to have
    modal width = max-width or full screen
    To allow this a global function and variable are defined and called/checked to
    allow modifications of the modal-options

    $.MODAL_ADJUST_OPTIONS = function(modalOptions, modal) return modal-options

    $.MODAL_NO_VERTICAL_MARGIN = false  If true all modal have vertical margin = 0

    By default it return the original options but they can be overwriten by applications/packages
    **********************************************************/
    $.MODAL_ADJUST_OPTIONS = function(modalOptions/*, modal*/){

        return modalOptions;
    };
    $.MODAL_NO_VERTICAL_MARGIN = false;

    /**********************************************************
    MAX-HEIGHT ISSUES ON SAFARI (AND OTHER BROWSER ON IOS)
    Due to an intended design in Safari it is not possible to
    use style a la max-height: calc(100vh - 20px) is not working
    as expected/needed
    Instead a resize-event is added to update the max-height of
    elements with the current value of window.innerHeight
    Sets both max-height and height to allow always-max-height options
    **********************************************************/
    function adjustModalMaxHeight( $modalContent ){
        var $modalContents = $modalContent || $('.modal-content.modal-flex-height');

        //For each $modalContent: Get the current data with options on relative size and set the height and max-height
        $modalContents.each(function(index, elem){
            var $modalContent = $(elem);

            $.each(modalSizeClassName, function(size, className){
                if ($modalContent.hasClass(className)){
                    //The current percent/offset info is in .data('relativeHeightOptions')[size];
                    var relativeOptions =
                            $.extend({
                                relativeHeight       : 1,
                                relativeHeightOffset : 2 * modalVerticalMargin,
                                parentContainerHeight: parseInt(window.innerHeight)
                            },
                                ($modalContent.data('relativeHeightOptions') || {})[size]
                            );

                    $.each(relativeOptions, function(id, value){
                        relativeOptions[id] = $.isFunction(value) ? value($modalContent) : value;
                    });

                    const maxHeight = relativeOptions.relativeHeight * relativeOptions.parentContainerHeight - relativeOptions.relativeHeightOffset;

                    $modalContent.css({
                        'max-height': maxHeight+'px',
                        'height'    : maxHeight+'px'
                    });
                }
            });
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
    options.fitWidth  : If true the width of the modal is set by the with of the content
    options.flexWidth : If true the width of the modal will adjust to the width of the browser up to 500px
    options.extraWidth: Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 800px
    options.megaWidth : Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 1200px
    options.maxWidth  : If true the width of the modal will always be 100% minus some margin
    options.fullWidth : If true the width of the modal will always be 100%
    options.fullScreen: If true the modal will fill the hole screen without border. width = height = 100%
    options.fullScreenWithBorder: As fullScreen but with borders
    options.width     : Set if different from 300

    ******************************************************/
    function getHeightFromOptions( options ){
        if (options.height)    return {height   : options.height+'px',    maxHeight: null};
        if (options.maxHeight) return {maxHeight: options.maxHeight+'px', height   : 'auto'};
        return null;
    }

    function getWidthFromOptions( options ){
        return {
            fitWidth            : !!options.fitWidth,
            flexWidth           : !!options.flexWidth,
            extraWidth          : !!options.extraWidth,
            megaWidth           : !!options.megaWidth,
            maxWidth            : !!options.maxWidth,
            fullWidth           : !!options.fullWidth,
            fullScreen          : !!options.fullScreen,
            fullScreenWithBorder: !!options.fullScreenWithBorder,
            width       : options.width ?
                            ( (typeof options.width == 'number') ? options.width+'px' : options.width)
                            : null
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
        //'Close' alle elements (eg. select-box)
        $._bsModal_closeMethods.forEach( options => {
            this.find(options.selector).each(function(){
                options.method($(this));
            });
        }, this);
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
        $._addModalBackdropLevel(this.bsModal.transparentBackground);

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

        //If in full-screen mode and dont reopen in full-screen => reset back
        if (this.bsModal.isFullScreenMode && this.bsModal.noReopenFullScreen)
            this._bsModalFullScreenOff();

        //Close elements
        this._bsModalCloseElements();

        //Never close pinned modals
        if (this.bsModal.isPinned)
            return false;

        //Remove all noty added on the modal and move down global backdrop
        $._bsNotyRemoveLayer();

        //Call onHide
        if (this.onHide)
            this.onHide(this);

        //Remove the modal from DOM
        if (this.removeOnClose)
            this.get(0).remove();
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
            if ((options.fixedContent === true) || (options.extended.fixedContent === true) || (options.extended.fixed === true)) {
                options.fixedContent = options.fixedContent === true ? options.extended.fixedContent : options.fixedContent;
                options.extended.fixedContent = ((options.extended.fixedContent === true) || (options.extended.fixed === true)) ? options.fixedContent : options.extended.fixedContent;
            }

            //If common footer content => add it as extended footer content
            if ((options.footer === true) || (options.extended.footer === true)) {
                options.footer = options.footer === true ? options.extended.footer : options.footer;
                options.extended.footer = options.extended.footer === true ? options.footer : options.extended.footer;
            }
        }

        //If options.minimized.fixedContent/fixed == true and/or options.minimized.footer == true => normal and minimized uses same fixed and/or footer content
        if (options.minimized){
            if ((options.minimized.fixedContent === true) || (options.minimized.fixed === true))
                options.minimized.fixedContent = options.fixedContent;

            if (options.minimized.footer === true)
                options.minimized.footer = options.footer;
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

            //Scroll all "body" back if keepScrollWhenReopen = false is set
            if (!this.keepScrollWhenReopen)
                ['', 'extended', 'minimized'].forEach( size => {
                    let obj = size ? this.bsModal[size] : this.bsModal;
                    if (obj && obj.$body){
                        obj.$body.scrollTop(0);
                        obj.$body.scrollLeft(0);
                    }
                }, this);
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
                'data-bs-toggle': 'modal',
                'data-bs-target': '#'+this.attr('id')
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
            //***********************************************************
            function updateElement($element, newOptions, methodName, param, param2, param3 ){
                if ($element && newOptions){
                    $element.empty();
                    $element[methodName](newOptions, param, param2, param3);
                }
            }
            //***********************************************************
            //Update header
            var $iconContainer = this.bsModal.$header.find('.header-icon-container').detach();
            updateElement(this.bsModal.$header, options, '_bsHeaderAndIcons', $.BSMODAL_USE_SQUARE_ICONS);
            this.bsModal.$header.append($iconContainer);

            _updateFixedAndFooterInOptions(options);

            //Update the tree size-contents
            [null, 'minimized', 'extended'].forEach( id => {
                var containers     = id ? this.bsModal[id] : this.bsModal,
                    contentOptions = id ? options[id]       : options;

                if (containers && contentOptions){
                    updateElement(containers.$fixedContent, contentOptions.fixedContent, '_bsAppendContent', contentOptions.fixedContentContext, contentOptions.fixedContentArg, options );
                    updateElement(containers.$content,      contentOptions.content,      '_bsAppendContent', contentOptions.contentContext,      contentOptions.contentArg,      options );
                    updateElement(containers.$footer,       contentOptions.footer,       '_bsAddHtml' );
                }
            }, this);


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
    $.fn._bsModalBodyAndFooter = function(size, options, parts, className, initSize, parentOptions = {}){

        options = $.extend(true, {}, parentOptions, options);

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


        //Find the correct alert-XX class from Bootstrap
        function getAlertClass( options = {}){
            var result = options.type || '';
            switch (result){
                case 'alert'  : result = 'primary'; break;
                case 'success': result = 'success'; break;
                case 'warning': result = 'warning'; break;
                case 'error'  : result = 'danger';  break;
                case 'info'   : result = 'info';    break;
                case 'help'   : result = 'light';   break;
            }
            return result ? 'alert-'+result : '';
        }

        function setInnerHeightAndInnerMaxHeight($elem, options){
            if (options.innerHeight)
                $elem.css('--inner-height',     typeof options.innerHeight == 'number'    ? options.innerHeight + 'px'    : options.innerHeight    );
            if (options.innerMaxHeight)
                $elem.css('--inner-max-height', typeof options.innerMaxHeight == 'number' ? options.innerMaxHeight + 'px' : options.innerMaxHeight );
        }

        //Append fixed content (if any)
        //If fixedContent.contetn exists => fixedContent is also the options for the fixed content
        //options.fixedContentOptions = options different from content for fixed-content
        var fixedOptions = $.extend({},
                options,
                {innerHeight:'auto', innerMaxheight: 'none'},
                options.fixedContent && options.fixedContent.content ? options.fixedContent : {},
                options.fixedContentOptions || {}
            ),
            $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed')
                    .addClass(className || '')
                    .toggleClass(scrollbarClass,                !!options._fixedContentHasScrollClass )
                    .toggleClass('py-0',                        !!fixedOptions.noVerticalPadding)
                    .toggleClass('pt-0',                        !!fixedOptions.noTopPadding)
                    .toggleClass('pb-0',                        !!fixedOptions.noBottomPadding)
                    .toggleClass('px-0',                        !!fixedOptions.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent', !!fixedOptions.semiTransparent)
                    .toggleClass('center-middle-content',       !!fixedOptions.centerMiddle)
                    .toggleClass('with-border',                 !!(fixedOptions.withBorder || fixedOptions.bottomBorder || fixedOptions.border))
                    .addClass( getAlertClass(fixedOptions) )
                    .addClass(options.fixedClassName || '')
                    .appendTo( this );

        if (options.fixedContent){
            $modalFixedContent._bsAppendContent( options.fixedContent.content ? options.fixedContent.content : options.fixedContent, options.fixedContentContext, null, options );
            setInnerHeightAndInnerMaxHeight($modalFixedContent, fixedOptions);
        }

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .toggleClass('modal-body-always-max-height', !!options.alwaysMaxHeight)
                    .toggleClass('py-0',                         !!options.noVerticalPadding)
                    .toggleClass('px-0',                         !!options.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent',  !!options.semiTransparent)
                    .toggleClass('center-middle-content',        !!options.centerMiddle)
                    .addClass( getAlertClass(options) )
                    .addClass(options.className || '')
                    .appendTo( this );

        setInnerHeightAndInnerMaxHeight($modalBody, options);

        if (!options.content || (options.content === {}))
            $modalBody.addClass('modal-body-no-content');

        var $modalContent = parts.$content =
                hasScroll ?
                    $modalBody
                        .addClass(scrollbarClass)
                        .addScrollbar({
                            direction       : scrollDirection,
                            contentClassName: options.noVerticalPadding ? '' : 'modal-body-with-vertical-padding' + (window.getScrollbarWidth() ? '' :' modal-body-with-horizontal-padding')
                        }) :
                    $modalBody;


        //Add content. If the content is 'dynamic' ie options.dynamic == true and options.content is a function, AND it is a different size => save function
        if (options.dynamic && (typeof options.content == 'function') && (size != initSize)){
            parts.dynamicContent        = options.content;
            parts.dynamicContentContext = options.contentContext;
            parts.dynamicContentArg     = options.contentArg;
        }
        else
            $modalContent._bsAppendContent( options.content, options.contentContext, options.contentArg, options  );

        //Add scroll-event to close any bootstrapopen -select
        if (hasScroll){
            $modalBody.on('scroll', function(){
                //Close all elements when scrolling
                $(this).parents('.modal').first()._bsModalCloseElements();
            });

            if (options.onScroll)
                $modalBody.on('scroll', options.onScroll);
        }

        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('footer-content ' + className)
                    .addClass(options.footerClass)
                    .addClass(options.footerClassName)
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
    $.fn._bsModalContent = function( options = {}){
        //this.bsModal contains all created elements
        this.bsModal = {};
        this.bsModal.onChange = options.onChange || null;

        this.bsModal.transparentBackground = !!options.transparentBackground;

        //bsModal.cssHeight and bsModal.cssWidth = [size] of { width or height options}
        this.bsModal.cssHeight = {};
        this.bsModal.cssWidth  = {};
        this.bsModal.sizes = MODAL_SIZE_NORMAL;

        /*
        If the modal have flex-height ie. the height is a percent of the parent containers height
        relativeHeightOptions = {size}{relativeHeight, relativeHeightOffset, parentContainerHeight} - See above
        */
        var relativeHeightOptions = null;
        function setRelativeHeightOptions(size, options){
            var relativeOptions = null;
            if (!getHeightFromOptions(options)){
                //Save only options different from default
                ['relativeHeight', 'relativeHeightOffset', 'parentContainerHeight'].forEach( id => {
                    var value = options[id];
                    if (value || (value === 0)){
                        relativeOptions = relativeOptions || {};
                        relativeOptions[id] = value;
                    }
                });

                if (relativeOptions){
                    relativeHeightOptions = relativeHeightOptions || {};
                    relativeHeightOptions[size] = relativeOptions;
                }
            }
        }

        //Set bsModal.cssHeight
        this.bsModal.cssHeight[MODAL_SIZE_NORMAL] = getHeightFromOptions( options );
        setRelativeHeightOptions(MODAL_SIZE_NORMAL, options);


        if (options.minimized){
            this.bsModal.sizes += MODAL_SIZE_MINIMIZED;
            this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED] = getHeightFromOptions(options.minimized);
            setRelativeHeightOptions(MODAL_SIZE_MINIMIZED, options.minimized);
        }

        if (options.extended){
            this.bsModal.sizes += MODAL_SIZE_EXTENDED;
            if (options.extended.height == true){
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = this.bsModal.cssHeight[MODAL_SIZE_NORMAL];
                setRelativeHeightOptions(MODAL_SIZE_EXTENDED, options);
            }
            else {
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = getHeightFromOptions( options.extended );
                setRelativeHeightOptions(MODAL_SIZE_EXTENDED, options.extended);
            }
        }

        //Set bsModal.cssWidth
        this.bsModal.cssWidth[MODAL_SIZE_NORMAL] = getWidthFromOptions( options );


        function useNormalWidth(options = {}){
            return (options.width == true) ||
                    (   (options.fitWidth == undefined) &&
                        (options.flexWidth == undefined) &&
                        (options.extraWidth == undefined) &&
                        (options.megaWidth == undefined) &&
                        (options.maxWidth == undefined) &&
                        (options.fullWidth == undefined) &&
                        (options.fullScreen == undefined) &&
                        (options.fullScreenWithBorder == undefined) &&
                        (options.width == undefined)
                    );
        }

        if (options.minimized)
            //If options.minimized.width == true or none width-options is set in extended => use same width as normal-mode
            this.bsModal.cssWidth[MODAL_SIZE_MINIMIZED] = useNormalWidth(options.minimized) ? this.bsModal.cssWidth[MODAL_SIZE_NORMAL] : getWidthFromOptions( options.minimized );

        if (options.extended)
            //If options.extended.width == true or none width-options is set in extended => use same width as normal-mode
            this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = useNormalWidth(options.extended) ? this.bsModal.cssWidth[MODAL_SIZE_NORMAL] : this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = getWidthFromOptions( options.extended );


        var $modalContent = this.bsModal.$modalContent =
                $('<div/>')
                    .addClass('modal-content')
                    .addClass(options.modalContentClassName)
                    .toggleClass('no-shadow', !!options.noShadow)
                    .modernizrOff('modal-pinned')
                    .modernizrOff('modal-set-to-full-screen')
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

        //Save info on relative height
        if (relativeHeightOptions)
            $modalContent.data('relativeHeightOptions', relativeHeightOptions);

        var initSize =  options.minimized && options.isMinimized ?
                            MODAL_SIZE_MINIMIZED :
                        options.extended && options.isExtended ?
                            MODAL_SIZE_EXTENDED :
                            MODAL_SIZE_NORMAL;

        this._bsModalSetSizeClass(initSize);
        this._bsModalSetHeightAndWidth();

        var modalExtend       = this._bsModalExtend.bind(this),
            modalDiminish     = this._bsModalDiminish.bind(this),
            modalToggleHeight = this._bsModalToggleHeight.bind(this),
            modalPin          = this._bsModalPin.bind(this),
            modalUnpin        = this._bsModalUnpin.bind(this),
            iconExtendClassName   = '',
            iconDiminishClassName = '',
            multiSize = this.bsModal.sizes > MODAL_SIZE_NORMAL;

        //If multi size: Set the class-name for the extend and diminish icons.
        if (multiSize){
            iconExtendClassName   = 'hide-for-modal-set-to-full-screen ' + (this.bsModal.sizes & MODAL_SIZE_EXTENDED  ? 'hide-for-modal-extended'  : 'hide-for-modal-normal');
            iconDiminishClassName = 'hide-for-modal-set-to-full-screen ' + (this.bsModal.sizes & MODAL_SIZE_MINIMIZED ? 'hide-for-modal-minimized' : 'hide-for-modal-normal');
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
                pin             : { className: 'hide-for-modal-pinned', onClick: options.onPin ? modalPin   : null },
                unpin           : { className: 'show-for-modal-pinned', onClick: options.onPin ? modalUnpin : null },

                fullScreenOn    : { className: 'modal-header-icon-full-screen-on hide-for-modal-set-to-full-screen',  onClick: options.allowFullScreen ? this._bsModalFullScreenOn.bind(this)  : null, altEvents:'swipeup'   },
                fullScreenOff   : { className: 'modal-header-icon-full-screen-off show-for-modal-set-to-full-screen', onClick: options.allowFullScreen ? this._bsModalFullScreenOff.bind(this) : null, altEvents:'swipedown' },

                extend          : { className: iconExtendClassName,     onClick: multiSize ? modalExtend   : null,                        altEvents:'swipeup'   },
                diminish        : { className: iconDiminishClassName,   onClick: multiSize ? modalDiminish : null,                        altEvents:'swipedown' },
                new             : {                                     onClick: options.onNew     ? options.onNew.bind(this)     : null                        },
                info            : {                                     onClick: options.onInfo    ? options.onInfo.bind(this)    : null                        },
                warning         : {                                     onClick: options.onWarning ? options.onWarning.bind(this) : null                        },
                help            : {                                     onClick: options.onHelp    ? options.onHelp.bind(this)    : null                        },
            }
        }, options );


        //Save parentOptions for dynamic update
        var parentOptions = this.bsModal.parentOptions = {};
        $.parentOptionsToInherit.forEach( id => {
            if (options.hasOwnProperty(id))
                parentOptions[id] = options[id];
        });


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
                        ._bsHeaderAndIcons( options, $.BSMODAL_USE_SQUARE_ICONS )
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

            if (options.minimized.showHeader){
                $modalContent.addClass('modal-minimized-full-header');
                options.minimized.showHeaderOnClick = false;
            }
            else {
                $modalContent.addClass('modal-minimized-hide-header');
                var bsModalToggleMinimizedHeader = $.proxy(this._bsModalToggleMinimizedHeader, this);
                options.minimized.onClick =
                    options.minimized.showHeaderOnClick ?
                        bsModalToggleMinimizedHeader :
                        modalExtend;

                //Close header when a icon is clicked
                if (options.minimized.showHeaderOnClick)
                    this.bsModal.$header.on('click', bsModalToggleMinimizedHeader);
            }

            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_MINIMIZED/*'minimized'*/, options.minimized, this.bsModal.minimized, '', initSize, parentOptions );

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

        $modalContent._bsModalBodyAndFooter(MODAL_SIZE_NORMAL/*'normal'*/, options, this.bsModal, '', initSize, parentOptions);

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};
            if (options.extended.clickable)
                options.extended.onClick = options.extended.onClick || modalDiminish;
            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_EXTENDED/*'extended'*/, options.extended, this.bsModal.extended, '', initSize, parentOptions);
        }

        //Add buttons (if any). Allways hidden for minimized. Need to add outer-div ($outer) to avoid
        //that $modalButtonContainer is direct children since show-for-modal-XX overwrite direct children display: flex with display: initial
        var $outer = $('<div/>').appendTo( $modalContent ),
            $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .appendTo( $outer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //Detect if the buttons need to be a block (width: 100%) and if it is for all size or not
        if (options.verticalButtons || (options.extended && options.extended.verticalButtons)){
            var verticalButtonsClass = 'vertical-buttons';
            if (options.extended){
                if (options.verticalButtons && (options.extended.verticalButtons === false))
                    //Only vertical buttons in mode = normal
                    verticalButtonsClass = 'vertical-buttons-for-normal';

                if (!options.verticalButtons && options.extended.verticalButtons)
                    //Only vertical buttons in mode = extended
                    verticalButtonsClass = 'vertical-buttons-for-extended';
            }

            $modalButtonContainer.addClass( verticalButtonsClass );
        }

        //If extende-content and extended.buttons = false => no buttons in extended
        if (options.extended && (options.extended.buttons === false))
            $modalButtonContainer.addClass('show-for-modal-normal');
        else
            $modalButtonContainer.addClass('show-for-no-modal-minimized');

        //If no button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        buttons.forEach( ( buttonOptions, index ) => {
            if (buttonOptions instanceof $){
                buttonOptions.appendTo( $modalButtonContainer );
                $modalButtons.push( buttonOptions );
            }
            else {
                focusAdded = focusAdded || buttonOptions.focus;
                if (!focusAdded && (index+1 == buttons.length ) )
                    buttonOptions.focus = true;

                //Add same onClick as close-icon if closeOnClick: true
                if (buttonOptions.closeOnClick)
                    buttonOptions.equalIconId = (buttonOptions.equalIconId || '') + ' close';

                buttonOptions.class = buttonOptions.class || buttonOptions.className || '';

                var $button =
                    $._anyBsButton( $.extend({}, defaultButtonOptions, buttonOptions ) )
                        .appendTo( $modalButtonContainer );

                //Add onClick from icons (if any)
                buttonOptions.equalIconId = buttonOptions.equalIconId || '';
                buttonOptions.equalIconId.split(' ').forEach( iconId => {
                    if (iconId && options.icons[iconId] && options.icons[iconId].onClick)
                        $button.on('click', options.icons[iconId].onClick);
                });

                $modalButtons.push( $button );
            }
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
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_MINIMIZED], size == MODAL_SIZE_MINIMIZED )
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_NORMAL],    size == MODAL_SIZE_NORMAL)
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_EXTENDED],  size == MODAL_SIZE_EXTENDED );
    };

    $.fn._bsModalGetSize = function(){
        var $modalContent = get$modalContent(this);
        return $modalContent.hasClass(modalSizeClassName[MODAL_SIZE_MINIMIZED]) ?
                   MODAL_SIZE_MINIMIZED :
               $modalContent.hasClass(modalSizeClassName[MODAL_SIZE_NORMAL]) ?
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

        if (!cssWidth){
            this._bsModalSetSize(MODAL_SIZE_NORMAL);
            return;
        }

        //Set height
        $modalContent
            .toggleClass('modal-fixed-height', !!cssHeight)
            .toggleClass('modal-flex-height', !cssHeight)
            .css( cssHeight ? cssHeight : {height: 'auto', maxHeight: null});
        if (!cssHeight)
            adjustModalMaxHeight( $modalContent );

        //Set width
        $modalDialog
            .toggleClass('modal-fit-width'              , cssWidth.fitWidth             )
            .toggleClass('modal-flex-width'             , cssWidth.flexWidth            )
            .toggleClass('modal-extra-width'            , cssWidth.extraWidth           )
            .toggleClass('modal-mega-width'             , cssWidth.megaWidth            )
            .toggleClass('modal-max-width'              , cssWidth.maxWidth             )
            .toggleClass('modal-full-width'             , cssWidth.fullWidth            )
            .toggleClass('modal-full-screen'            , cssWidth.fullScreen           )
            .toggleClass('modal-full-screen-with-border', cssWidth.fullScreenWithBorder )
            .css('width', cssWidth.width ? cssWidth.width : '' );


        if (this.bsModal.isFullScreenMode){
            this._bsModalFullScreenOff();
            this._bsModalFullScreenOn();
        }

        //Call onChange (if any)
        if (bsModal.onChange)
            bsModal.onChange( bsModal );
    };

    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight,
    _bsModalSetSize, _bsModalToggleMinimizedHeader,
    _bsModalFullScreenOn, _bsModalFullScreenOff
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
            parts.$content._bsAppendContent( parts.dynamicContent, parts.dynamicContentContext, parts.dynamicContentArg, this.bsModal.parentOptions );

            parts.dynamicContent        = null;
            parts.dynamicContentContext = null;
            parts.dynamicContentArg     = null;
        }

        this._bsModalSetSizeClass(size);
        this._bsModalSetHeightAndWidth();
    };

    //hid/show header for size = minimized
    $.fn._bsModalToggleMinimizedHeader = function(){
        if (this._bsModalGetSize() == MODAL_SIZE_MINIMIZED)
            get$modalContent(this).toggleClass('modal-minimized-hide-header');
    };

    //Toggle full screen
    $.fn._bsModalFullScreenOn = function(){
        let bsModal       = this.bsModal,
            $modalDialog  = bsModal.$modalDialog,
            isExtended    = $modalDialog.hasClass('modal-full-screen-at-extended'),
            $modalContent = bsModal.$modalContent,
            $modalBody    = isExtended ? bsModal.extended.$body : bsModal.$body;

        //Save and remove width and height set direct in css and
        bsModal.saveWidth  = $modalDialog.css('width');
        $modalDialog.css('width', '');
        bsModal.saveHeight = $modalContent.css('height');
        $modalContent.css('height', '');

        //Save and remove any 'size'-classes
        bsModal.saveDialogContentClass = $modalDialog.get(0).className;
        bsModal.saveModalContentClass  = $modalContent.get(0).className;
        bsModal.saveBodyClass          = $modalBody.get(0).className;

        let classNames = [
                'modal-fixed-height',
                'modal-flex-height',
                'modal-flex-width',
                'modal-extra-width',
                'modal-mega-width',
                'modal-full-width',
            ].join(' ');

        $modalDialog.removeClass(classNames);
        $modalContent.removeClass(classNames);
        $modalBody.removeClass(classNames);

        //Set new classes to make size = full screen
        $modalDialog.addClass ('modal-max-width modal-full-screen modal-full-screen-with-border');
        $modalContent.addClass('modal-flex-height');
        $modalContent.addClass('modal-' + (isExtended ? 'extended' : 'normal') + '-always-max-height');

        $modalBody.addClass   ('modal-body-always-max-height');

        //Save data-relativeHeightOptions from modal-content and set new with no margin
        bsModal.save_relativeHeightOptions = $modalContent.data('relativeHeightOptions') || {};

        let newData = {};
        newData[MODAL_SIZE_NORMAL] = newData[MODAL_SIZE_EXTENDED] = {  relativeHeightOffset: 0 };
        $modalContent.data('relativeHeightOptions', newData);
        adjustModalMaxHeight( $modalContent );

        $modalContent.modernizrOn('modal-set-to-full-screen');

        bsModal.isFullScreenMode = true;
    };


    $.fn._bsModalFullScreenOff = function(){
        let bsModal       = this.bsModal,
            $modalDialog  = bsModal.$modalDialog,
            isExtended    = $modalDialog.hasClass('modal-full-screen-at-extended'),
            $modalContent = bsModal.$modalContent,
            $modalBody    = isExtended ? bsModal.extended.$body : bsModal.$body;

        //Reset original size-classes
        $modalDialog.get(0).className   = bsModal.saveDialogContentClass;
        $modalContent.get(0).className  = bsModal.saveModalContentClass;
        $modalBody.get(0).className     = bsModal.saveBodyClass;

        //Reset data-relativeHeightOptions
        $modalContent.data('relativeHeightOptions', bsModal.save_relativeHeightOptions);
        adjustModalMaxHeight( $modalContent );

        //Reset original width and height set direct in css
        $modalDialog.css('width',   bsModal.saveWidth || '');
        $modalContent.css('height', bsModal.saveHeight || '');

        $modalContent.modernizrOff('modal-set-to-full-screen');

        bsModal.isFullScreenMode = false;
    };




/* TODO: animate changes in height and width - Use Bootstrtap 5 collaps
       var $this = this.bsModal.$container,
            oldHeight = $this.outerHeight(),
            newHeight;

        $this.modernizrToggle(modalSizeClassName[MODAL_SIZE_EXTENDED]);

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

        //Adjust options by MODEL_ADJUST_OPTIONS
        options = $.MODAL_ADJUST_OPTIONS(options, this);

        //Set default removeOnClose
        if ( (options.defaultRemoveOnClose || options.defaultRemove) &&
             (options.remove === undefined) &&
             (options.removeOnClose === undefined) )
            options.remove = !!options.defaultRemoveOnClose || !!options.defaultRemove;

        //Prevent allow-full-screen if already set
        if (options.fullScreen || options.fullScreenWithBorder)
            options.allowFullScreen = false;



        function adjustFullScreenOptions( opt, defaultOpt={} ){
            if (!opt) return;
            ['fullScreenWithBorder', 'fullScreen'].forEach( id => {
                if (opt[id] === undefined)
                    opt[id] = defaultOpt[id] || false;
            });
            if (opt.fullScreenWithBorder)
                opt.fullScreen = true;

            //Set options for full screen
            if (opt.fullScreen){
                opt.maxWidth             = true;
                opt.alwaysMaxHeight      = true;
                opt.relativeHeightOffset = 0;
            }
        }

        //Set options for full screen with border
        adjustFullScreenOptions(options);
        adjustFullScreenOptions(options.minimized, options);
        adjustFullScreenOptions(options.extended, options);

        //Check $.MODAL_NO_VERTICAL_MARGIN
        if ($.MODAL_NO_VERTICAL_MARGIN){
            options.relativeHeightOffset = 0;
            if (options.extended)
                options.extended.relativeHeightOffset = 0;
        }

        //Set options for a modal inside a container
        if (options.$container){
            options.show      = true;
            options.fullWidth = !options.width;
            if (options.minimized){
                options.minimized.width = options.minimized.width || options.width;
                options.minimized.fullWidth = !options.minimized.width;
            }
            if (options.extended){
                options.extended.width = options.extended.width || options.width;
                options.extended.fullWidth = !options.extended.width;
                options.extended.height = options.extended.height || true;
            }
        }

        //If allowFullScreen: Find the largest size-mode and set the differnet class-names etc.
        if (options.allowFullScreen)
            options.sizeWithFullScreen = options.extended ? MODAL_SIZE_EXTENDED : MODAL_SIZE_NORMAL;


        //Set keepScrollWhenReopen to allow the content to be scrolled back to 0,0 when reopen a modal
        this.keepScrollWhenReopen = options.keepScrollWhenReopen;

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

        if (options.allowFullScreen)
            $modalDialog.addClass('modal-full-screen-at-' + (options.extended ? 'extended' : 'normal') );


        //Extend with prototype
        $result.extend( bsModal_prototype );

        //Add close-icon and create modal content
        options.icons = options.icons || {};
        options.icons.close = $.extend(true, options.icons.close, { onClick: $.proxy( bsModal_prototype.close, $result) } );

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
        $result.onHide = options.onHide;


        //Create as modal and adds methods - only allow close by esc for non-static modal (typical a non-form)
        new bootstrap.Modal($result, {
           //Name       Value                                   Type                Default Description
           backdrop :   options.static ? "static" : true,   //  boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   !options.static,                    //  boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,                               //  boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false                               //  boolean	            true	Shows the modal when initialized.
        });
        $result.bsModal = $modalDialog.bsModal;

        $result.bsModal.$modalDialog = $modalDialog;

        $result.removeOnClose = options.remove || options.removeOnClose;

        if (options.historyList){
            //Hide back- and forward-icons
            $result.getHeaderIcon('back').css('visibility', 'hidden');
            $result.getHeaderIcon('forward').css('visibility', 'hidden');
        }

        if (options.$container){
            $result.addClass('show');
            $result.appendTo( options.$container );
            options.$container.addClass('modal-fixed-container');
        }
        else {
            $result.on({
                'show.bs.modal'  : show_bs_modal.bind($result),
                'shown.bs.modal' : shown_bs_modal,
                'hide.bs.modal'  : hide_bs_modal.bind($result),
                'hidden.bs.modal': hidden_bs_modal
            });
            $result.appendTo( $('body') );
            if (options.show)
                $result.show();
        }

        //Save some options in bsModal
        ['noReopenFullScreen'].forEach( id => {
            $result.bsModal[id] = options[id];
        });

        return $result;
    };

}(jQuery, this.bootstrap, this, document));