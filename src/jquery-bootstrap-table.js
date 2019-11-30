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

        align        : 'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
TODO:   truncate     : false. If true the column will be truncated. Normally only one column get truncate: true
        fixedWidth   : false. If true the column will not change width when the tables width is changed

        sortable     :  [boolean] false
        sortBy       : [string or function(e1, e2): int] "string". Possible values: "int" (sort as float), "moment", "moment_date", "moment_time" (sort as moment-obj) or function(e1, e2) return int
        sortIndex    : [int] null. When sorting and to values are equal the values from an other column is used.
                                   The default order of the other columns to test is given by the its index in options.columns. Default sortIndex is (column-index+1)*100 (first column = 100). sortIndex can be set to alter the order.
        sortDefault  : [string or boolean]. false. Possible values = false, true, "asc" or "desc". true => "asc"
        sortHeader   : [boolean] false. If true a header-row is added every time the sorted value changes

    }

    showHeader          [boolean] true
    verticalBorder      [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder            [boolean] false. When true no borders are visible
    hoverRow            [boolean] true. When true the row get hightlightet when hovered
    noPadding           [boolean] false. When true the vertical padding of all cells are 0px

    notFullWidth        [boolean] false. When true the table is not 100% width and will adjust to it content
    centerInContainer   [boolean] false. When true the table is centered inside its container. Normaally it require notFullWidth: true

    selectable          [boolean] false
    selectedId          [string] "" id for selected row
    onChange            [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected   [boolean] false. If true it is allowed to un-select a selected row
    allowReselect       [Boolean] false. If true the onChange is called when a selected item is reselected/clicked

    defaultColunmOptions: {}. Any of the options for columns to be used as default values

    rowClassName      : [] of string. []. Class-names for each row

    Sorting is done by https://github.com/joequery/Stupid-Table-Plugin


*******************************************************************/

    /********************************************************************
    Different sort-functions for moment-objects: (a,b) return a-b
    ********************************************************************/
    function momentSort(m1, m2, startOf){
        var moment1 = moment(m1),
            moment2 = moment(m2);

        if (startOf){
            moment1.startOf(startOf);
            moment2.startOf(startOf);
        }
        return moment1 - moment2;
    }

    //momentDateSort - sort by date despide the time
    function momentDateSort(m1, m2){
        return momentSort(m1, m2, 'day');
    }

    //momentTimeSort - sort by time despide ther date
    function momentTimeSort(m1, m2){
        return momentSort(
            moment(m1).date(1).month(0).year(2000),
            moment(m2).date(1).month(0).year(2000)
        );
    }



    var defaultOptions = {
            baseClass           : 'table',
            styleClass          : 'fixed',
            showHeader          : true,
            verticalBorder      : true,
            noBorder            : false,
            hoverRow            : true,
            noPadding           : false,
            notFullWidth        : false,
            centerInContainer   : false,
            useTouchSize        : true,
            defaultColunmOptions: {},
            rowClassName        : [],

            stupidtable: {
                'moment'     : momentSort,
                'moment_date': momentDateSort,
                'moment_time': momentTimeSort
            }
        },

        defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            fixedWidth   : false,
            sortBy       : 'string',
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

            if (options.rowClassName.length){
                var rowIndex = $tbody.children('tr').length - 1;
                if (options.rowClassName.length > rowIndex)
                    $tr.addClass(options.rowClassName[rowIndex]);
            }

            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);

            $.each( options.columns, function( index, columnOptions ){
                var content = rowContent[columnOptions.id],
                    $td = $('<td/>').appendTo($tr);
                adjustThOrTd( $td, columnOptions, !options.showHeader );

                if ($.isPlainObject(content) && content.className)
                    $td.addClass(content.className);

                //Build the content using the createContent-function, _bsAppendContent, or jquery-value-format
                if (columnOptions.createContent){
                    columnOptions.createContent( content, $td );
                    //Save original contant as sort-by-value
                    $td.data('sort-value', content );
                }
                else
                    if (columnOptions.vfFormat)
                        $td.vfValueFormat( content, columnOptions.vfFormat, columnOptions.vfOptions );
                    else
                        $td._bsAppendContent( content );
            });

            //Add rows to radioGroup
            if (options.selectable)
                options.radioGroup.addElement( $tr );
        },


        /**********************************************************
        _getColumn - Return the column with id or index
        **********************************************************/
        _getColumn: function( idOrIndex ){
            return $.isNumeric(idOrIndex) ? this.columns[idOrIndex] : this.columnIds[idOrIndex];
        },

        /**********************************************************
        sortBy - Sort the table
        **********************************************************/
        sortBy: function( idOrIndex, dir ){
            var column = this._getColumn(idOrIndex);
            if (column)
                column.$th.stupidsort( dir );
        },

        /**********************************************************
        beforeTableSort - Called before the table is being sorted by StupidTable
        **********************************************************/
        beforeTableSort: function(event, sortInfo){
            var column          = this._getColumn(sortInfo.column),
                sortMulticolumn = column.$th.attr('data-sort-multicolumn') || '',
                _this           = this;

            //Remove all group-header-rows
            this.find('.table-sort-group-header').remove();

            //Convert sortMulticolumn to array
            sortMulticolumn = sortMulticolumn ? sortMulticolumn.split(',') : [];
            sortMulticolumn.push(column.index);

            $.each( sortMulticolumn, function( dummy, columnIndex ){
                var column = _this._getColumn( columnIndex );
                //If cell-content is vfFormat-object => Set 'sort-value' from vfFormat
                if (column.vfFormat){
                    _this.find('td:nth-child('+(column.index+1)+')').each( function( dummy, td ){
                        var $td = $(td);
                        $td.data( 'sort-value', $td.vfValue() );
                    });
                }
            });
        },

        /**********************************************************
        afterTableSort - Called after the table is being sorted by StupidTable
        **********************************************************/
        afterTableSort: function(event, sortInfo){
            //Update the class-names of the cloned <thead>
            var cloneThList = this.$theadClone.find('th');
            this.find('thead th').each( function( index, th ){
                $(cloneThList[index])
                    .removeClass()
                    .addClass( $(th).attr('class') );
            });

            var column = this._getColumn( sortInfo.column );

            //Marks first row of changed value
            if (column.sortHeader) {

                //$tdBase = a <td> as $-object acting as base for all tds in header-row
                var $tdBase =
                        $('<td/>')
                            .addClass('container-icon-and-text')
                            .attr('colspan', this.columns.length );
                column.$th.contents().clone().appendTo( $tdBase );
                $tdBase.append( $('<span>:</span>') );

                var lastText = "Denne her text kommer sikkert ikke igen";
                this.find('tbody tr td:nth-child(' + (sortInfo.column+1) +')').each( function( index, td ){
                    var $td = $(td),
                        nextText = $td.text();
                    if (nextText != lastText){
                        //Create a clone of $tdBase and 'copy' all children from $td to $newTd
                        var $newTd = $tdBase.clone(true);
                        $td.contents().clone().appendTo( $newTd );

                        //Create new row and insert before current row
                        $('<tr/>')
                            .addClass('table-sort-group-header')
                            .append( $newTd )
                            .insertBefore( $td.parent() );

                        lastText = nextText;
                    }
                });
            }
        },

        /**********************************************************
        asModal - display the table in a modal-window with fixed header and scrolling content
        **********************************************************/
        asModal: function( modalOptions ){
            var showHeader = this.find('.no-header').length == 0,
                _this      = this,
                $tableWithHeader,
                $result, $thead, count;

            if (showHeader){
                //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
                //Add on-click on the clone to 'pass' the click to the original header
                this.$theadClone = this.find('thead').clone( true, false );

                this.$theadClone.find('th').on('click', function( event ){
                    var columnIndex = $(event.delegateTarget).index();
                    _this.sortBy( columnIndex );
                });

                $tableWithHeader =
                    $('<table/>')
                        ._bsAddBaseClassAndSize( this.data(dataTableId) )
                        .addClass('table-with-header')
                        .append( this.$theadClone );
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
                            _this.$theadClone.find('th:nth-child(' + (index+1) + ')')
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

    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId    = 0,
        rowId      = 0,
        sortId     = 0;

    $.bsTable = function( options ){

        options = $._bsAdjustOptions( options, defaultOptions );
        options.class =
//Removed because useTouchSize added to options            (options.small ? 'table-sm ' : '' ) +
            (options.verticalBorder && !options.noBorder ? 'table-bordered ' : '' ) +
            (options.noBorder ? 'table-no-border ' : '' ) +
            (options.hoverRow ? 'table-hover ' : '' ) +
            (options.noPadding ? 'table-no-padding ' : '' ) +
            (options.notFullWidth ? 'table-not-full-width ' : '' ) +
            (options.centerInContainer ? 'table-center-in-container ' : '' ) +
            (options.selectable ? 'table-selectable ' : '' ) +
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' );

        //Adjust each column
        var columnIds = {};

        $.each( options.columns, function( index, columnOptions ){
            columnOptions.sortable = columnOptions.sortable || columnOptions.sortBy;
            columnOptions = $.extend( true,
                {
                    index    : index,
                    sortIndex: (index+1)*100
                },
                defaultColunmOptions,
                options.defaultColunmOptions,
                columnOptions
            );

            columnIds[columnOptions.id] = columnOptions;
            options.columns[index] = columnOptions;

            //If column is sortable and sortBy is a function => add function to options.stupidtable
            if (columnOptions.sortable && $.isFunction(columnOptions.sortBy)){
                var stupidtableSortId = 'stupidtableSort'+ sortId++;
                options.stupidtable[stupidtableSortId] = columnOptions.sortBy;
                columnOptions.sortBy = stupidtableSortId;
            }
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

        $table.columns = options.columns;
        $table.columnIds = columnIds;

        //Create colgroup
        var $colgroup = $('<colgroup/>').appendTo($table);
        $.each( options.columns, function( index, columnOptions ){
            var $col = $('<col/>').appendTo( $colgroup );
            if (columnOptions.fixedWidth)
                $col.attr('width', '1');
        });

        var sortableTable  = false,
            sortDefaultId  = '',
            sortDefaultDir = 'asc',
            multiSortList  = [];

        /* From https://github.com/joequery/Stupid-Table-Plugin:
            "A multicolumn sort allows you to define secondary columns to sort by in the event of a tie with two elements in the sorted column.
                Specify a comma-separated list of th identifiers in a data-sort-multicolumn attribute on a <th> element..."

            multiSortList = []{columnIndex, sortIndex} sorted by sortIndex. Is used be each th to define alternative sort-order
        */
        $.each( options.columns, function( index, columnOptions ){
            if (columnOptions.sortable)
                multiSortList.push( {columnId: columnOptions.id, columnIndex: ''+index, sortIndex: columnOptions.sortIndex });
        });
        multiSortList.sort(function( c1, c2){ return c1.sortIndex - c2.sortIndex; });

        //Create headers
        if (options.showHeader)
            $.each( $table.columns, function( index, columnOptions ){
                columnOptions.$th = $('<th/>').appendTo( $tr );

                if (columnOptions.sortable){
                    columnOptions.$th
                        .addClass('sortable')
                        .attr('data-sort', columnOptions.sortBy);

                    if (columnOptions.sortDefault){
                        sortDefaultId  = columnOptions.id;
                        sortDefaultDir = columnOptions.sortDefault == 'desc' ? 'desc' : sortDefaultDir;
                    }

                    //Create alternative/secondary columns to sort by
                    var sortMulticolumn = '';
                    $.each( multiSortList, function( index, multiSort ){
                        if (multiSort.columnIndex != columnOptions.index)
                            sortMulticolumn = (sortMulticolumn ? sortMulticolumn + ',' : '') + multiSort.columnIndex;
                    });

                    if (sortMulticolumn){
                        /*
                        Bug fix in jquery-stupid-table
                        if sortMulticolumn == index for one column ("X") => data('sort-multicolumn') return an integer => error in jquery-stupid-table (split not a method for integer)
                        Solved by setting sortMulticolumn = "X,X" instead of X when only ons column is included
                        */
                        if (sortMulticolumn.indexOf(',') == -1)
                            sortMulticolumn = sortMulticolumn + ',' + sortMulticolumn;

                        columnOptions.$th.attr('data-sort-multicolumn', sortMulticolumn);
                    }
                    sortableTable = true;
                }


                adjustThOrTd( columnOptions.$th, columnOptions, true );

                columnOptions.$th._bsAddHtml( columnOptions.header );
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

        if (sortableTable){
            $table.stupidtable =
                $table.stupidtable( options.stupidtable )
                    .bind('beforetablesort', $.proxy( $table.beforeTableSort, $table ) )
                    .bind('aftertablesort',  $.proxy( $table.afterTableSort,  $table ) );

            if (sortDefaultId, sortDefaultDir)
                $table.sortBy(sortDefaultId, sortDefaultDir);
        }
        return $table;
    };



}(jQuery, this, document));