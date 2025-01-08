/****************************************************************************
	jquery-bootstrap-tabs.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};


    $.BSASMODAL.BSTABS = function( options ){
        var $result =
                $.bsModal(
                    $.extend( {
                        flexWidth          : true,
                        noVerticalPadding  : true,
                        noHorizontalPadding: true,
                        scroll             : false,
                        content            : this._$contents,
                        fixedContent       : this._$tabs,
                    }, options)
               );

        //Save ref to the scrollBar containing the content and update scrollBar when tab are changed
        var $scrollBar = $result.data('bsModalDialog').bsModal.$content.parent();
        this._$tabs.find('a').on('shown.bs.tab', function() {
            $scrollBar.perfectScrollbar('update');
        });

        return $result;
    };


    /******************************************************
    bsTabs
<nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <a class="nav-item nav-link selected" id="nav-home-tab" data-bs-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true"><i class="fa fa-home"></i>&nbsp;<span>Home</span></a>
        <a class="nav-item nav-link" id="nav-profile-tab" data-bs-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</a>
        <a class="nav-item nav-link" id="nav-contact-tab" data-bs-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</a>
    </div>
</nav>
<div class="tab-content" id="nav-tabContent">
    <div class="tab-pane fade show selected" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. Fugiat ipsum excepteur in aliqua non et quis aliquip ad irure in labore cillum elit enim. Consequat aliquip incididunt ipsum et minim laborum laborum laborum et cillum labore. Deserunt adipisicing cillum id nulla minim nostrud labore eiusmod et amet. Laboris consequat consequat commodo non ut non aliquip reprehenderit nulla anim occaecat. Sunt sit ullamco reprehenderit irure ea ullamco Lorem aute nostrud magna.</div>
    <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">SECOND</div>
    <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">THIRD</div>
</div>
    ******************************************************/
    var tabsId = 0;
    $.bsTabs = function( options ){
        var $result = $('<div/>')
                        .addClass('BSTABS'),
            id = 'bsTabs'+ tabsId++,

            $tabs =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'nav',
                            styleClass  : '',
                            class       : 'nav-tabs' + (options.hideNotSelectedText ? ' hide-not-selected-text' : ''),
                            useTouchSize: true
                        })
                    )
                    .attr({'id': id, 'role': "tablist"})
                    .appendTo( $result ),

            $contents =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'tab-content',
                            styleClass  : '',
                            class       : '',
                            useTouchSize: false
                        })
                    )
                    .attr({'id': id+'content'})
                    .appendTo( $result );

        if (options.height)
            $contents.height( options.height );


        options.list.forEach( ( opt, index ) => {
            opt = $._bsAdjustOptions( opt );
            var tabId = options.id || id + 'tab' + index,
                contentId = tabId + 'content',
                //Create the tab
                $tab =
                    $('<a/>')
                        .addClass('nav-item nav-link')
                        .attr({
                            'id'            : tabId,
                            'role'          : 'tab',
                            'data-bs-toggle': "tab",
                            'data-user-id'  : opt.id || null,
                            'href'          : '#'+contentId,
                            'aria-controls' : contentId
                        })
                        ._bsAddHtml( opt.header || opt )
                        .appendTo( $tabs ),

                //Create the content-container = content + footer
                $container =
                    $('<div/>')
                        .addClass('tab-pane fade')
                        .attr({
                            'id'             : contentId,
                            'role'           : 'tabpanel',
                            'aria-labelledby': tabId
                        })
                        .appendTo( $contents ),

                $content =
                    $('<div/>')
                        .addClass('tab-inner-content')
                        .appendTo( $container );

            //Adding footer
            $('<div/>')
                .addClass('tab-footer')
                ._bsAddHtml( opt.footer )
                .appendTo( $container );

            if (opt.selected){
                $tab
                    .attr('aria-selected', true)
                    .addClass('active');
                $container.addClass('active show');
            }

            $content = options.scroll ? $content.addScrollbar('vertical') : $content;


            //Add content: string, element, function, setup-json-object, or children (=accordion)
            if (opt.content)
                $content._bsAppendContent( opt.content, opt.contentContext, null, options );

        });
        $result._$tabs = $tabs;
        $result._$contents = $contents;

        return $result;
    };

    //Extend $.fn with method to select a tab given by id (string) or index (integer)
    $.fn.bsSelectTab = function( indexOrId ){
        var $tab =
            $.type(indexOrId) == 'number' ?
            this.find('.nav-tabs a.nav-item:nth-of-type('+(indexOrId+1)+')') :
            this.find('.nav-tabs a.nav-item[data-user-id="' + indexOrId + '"]');

        if ($tab && $tab.length)
            $tab.tab('show');
    };


    /**********************************************************
    asModal - display the tabs in a modal-window with fixed header and scrolling content
    **********************************************************/
    $.BSASMODAL.BSTABS = function( modalOptions = {}){
        return $.bsModal(
                    $.extend( modalOptions, {
                        show        : false,
                        content     : this._$contents,
                        fixedContent: this._$tabs,
                        fixedContentOptions: {
                            noBottomPadding: true
                        }
                    })
                );
    };

}(jQuery, this, document));