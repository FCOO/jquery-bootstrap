/****************************************************************************
	jquery-bootstrap-table.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsTable( options )
options
    columns = [] of {
        id,
        header   :  {icon, text, link, textStyle} or [] of {text,...}
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        :  'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
TODO:         truncate     : false. If true the column will be truncated. Normally only one column get truncate: true

        sortable :  [boolean] false
    }
    showHeader: [boolean] true
    verticalBorder [boolean] true
    selectable [boolean] false
    selectedId [string] "" id for selected row
    onChange          [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected [boolean] false. If true it is allowed to un-select a selected row
    allowReselect     [Boolean] false. If true the onChange is called when a selected item is reselected/clicked

TODO
Add sort-functions + save col-index for sorted column


*******************************************************************/
    var defaultOptions = {
            baseClass     : 'table',
            styleClass    : 'fixed',
            showHeader    : true,
            verticalBorder: true,
            useTouchSize  : true

        },

        defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            sortable     : false
        },

        dataTableId = 'bsTable_options';


    //********************************************************************
    function adjustThOrTd( $element, columnOptions, addWidth ){
        $element
            ._bsAddStyleClasses( columnOptions.textStyle )
            .addClass('align-' + columnOptions.verticalAlign )
            ._bsAddStyleClasses( columnOptions.align )
            .toggleClass('text-nowrap', !!columnOptions.noWrap )
//TODO            .toggleClass('text-truncate', !!columnOptions.truncate )
            .toggleClass('no-horizontal-padding', !!columnOptions.noHorizontalPadding );

        if (addWidth && columnOptions.width)
            $element.css({
                'width'    : columnOptions.width,
                'max-width': columnOptions.width
            });

        return $element;
    }

    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( rowContent ){
            var options = this.data(dataTableId),
                $tbody  = this.find('tbody').first(),
                $tr     = $('<tr/>').appendTo( $tbody );

            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);

            $.each( options.columns, function( index, columnOptions ){
                var content = rowContent[columnOptions.id],
                    $td = $('<td/>')
                            .appendTo($tr);
                adjustThOrTd( $td, columnOptions, !options.showHeader );

                //Build the content using _bsAppendContent or jquery-value-format
                if (columnOptions.vfFormat)
                    $td.vfValueFormat( content, columnOptions.vfFormat, columnOptions.vfOptions );
                else {
                    $td._bsAppendContent( content );
                }
            });

            //Add rows to radioGroup
            if (options.selectable){
                options.radioGroup.addElement( $tr );
                $tr
                    .on('mouseenter', $.proxy($tr._selectlist_onMouseenter, $tr) )
                    .on('mouseleave', $.proxy($tr._selectlist_onMouseleave, $tr) );

//            .on('mouseleave', $.proxy($result._selectlist_onMouseleaveList, $result) )

            }
        },

        /**********************************************************
        asModal - display the table in a modal-window with fixed header and scrolling content
        **********************************************************/
        asModal: function( modalOptions ){
            var showHeader = this.find('.no-header').length == 0,
                _this      = this,
                $theadClone,
                $tableWithHeader = null,
                $result, $thead, count;

            if (showHeader){
                //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
                $theadClone = this.find('thead').clone( true );
                $tableWithHeader =
                    $('<table/>')
                        ._bsAddBaseClassAndSize( this.data(dataTableId) )
                        .addClass('table-with-header')
                        .append( $theadClone );
                $thead = this.find('thead');
                count  = 20;
            }


            $result = $.bsModal(
                            $.extend( modalOptions || {}, {
                                flexWidth        : true,
                                noVerticalPadding: true,
                                content          : this,
                                fixedContent     : $tableWithHeader
                            })
                          );

            if (showHeader){
                //Using timeout to wait for the browser to update DOM and get height of the header
                var setHeaderHeight = function(){
                        var height = $tableWithHeader.outerHeight();
                        if (height <= 0){
                            count--;
                            if (count){
                                //Using timeout to wait for the browser to update DOM and get height of the header
                                setTimeout( setHeaderHeight, 50 );
                                return;
                            }
                        }

                        _this.css('margin-top', -height+'px');
                        setHeaderWidth();

                        //Only set header-height once
                        $result.off('shown.bs.modal.table', setHeaderHeight );
                    },

                    setHeaderWidth = function(){
                        $thead.find('th').each(function( index, th ){
                            $theadClone.find('th:nth-child(' + (index+1) + ')')
                                .width( $(th).width()+'px' );
                        });
                        $tableWithHeader.width( _this.width()+'px' );
                    };

                $result.on('shown.bs.modal.table', setHeaderHeight );
                $thead.resize( setHeaderWidth );
            }

            return $result;
        }

    }; //end of bsTable_prototype = {

    //**********************************************************
    function table_th_onClick( event ){
        var $th = $( event.currentTarget ),
            sortable = $th.hasClass('sortable'),
            newClass = $th.hasClass('desc') ? 'asc' : 'desc'; //desc = default

        if (sortable){
            //Remove .asc and .desc from all th
            $th.parent().find('th').removeClass('asc desc');
            $th.addClass(newClass);
        }
    }

    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId  = 0,
        rowId    = 0;

    $.bsTable = function( options ){

        options = $._bsAdjustOptions( options, defaultOptions );
        options.class =
//Removed because useTouchSize added to options            (options.small ? 'table-sm ' : '' ) +
            (options.verticalBorder ? 'table-bordered ' : '' ) +
            (options.selectable ? 'table-selectable ' : '' ) +
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' ),

        //Adjust text-style for each column
        $.each( options.columns, function( index, column ){
            column = $.extend( true, {}, defaultColunmOptions, column );

            column.index = index;

            options.columns[index] = column;
        });

        var id = 'bsTable'+ tableId++,
            $table = $('<table/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id': id
                        }),
            $thead = $('<thead/>')
                        .toggleClass('no-header', !options.showHeader )
                        .appendTo( $table ),
            $tr = $('<tr/>')
                    .appendTo( $thead );

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

        //Create headers
        if (options.showHeader)
            $.each( options.columns, function( index, columnOptions ){
                var $th = $('<th/>')
                            .toggleClass('sortable', !!columnOptions.sortable )
                            .on('click', table_th_onClick )
                            .appendTo( $tr );

                adjustThOrTd( $th, columnOptions, true );

                $th._bsAddHtml( columnOptions.header );
            });

        if (options.selectable){
            var radioGroupOptions = $.extend( true, {}, options );
            radioGroupOptions.className = 'active';
            options.radioGroup = $.radioGroup( radioGroupOptions );
        }

        $table.data(dataTableId, options);


        //Create tbody and all rows
        $table.append( $('<tbody/>') );

        $.each( options.content, function( index, rowContent ){
            $table.addRow( rowContent );
        });

        if (options.selectable)
            $table
                .on('mouseleave', $.proxy($table._selectlist_onMouseleaveList, $table) )
                .find('.active').addClass('highlighted');


        return $table;
    };

}(jQuery, this, document));