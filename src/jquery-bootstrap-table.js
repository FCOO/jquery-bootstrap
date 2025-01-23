/****************************************************************************
	jquery-bootstrap-table.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next/*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};

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

        createContent : function(content, $td, sortBy) Create the content inside $td. Optional

        sortable            :  BOOLEAN false
        sortBy              : [string or function(e1, e2): int] "string". Possible values: "int" (sort as float), "moment", "moment_date", "moment_time" (sort as moment-obj) or function(e1, e2) return int
        sortIndex           : [int] null. When sorting and to values are equal the values from an other column is used.
                             The default order of the other columns to test is given by the its index in options.columns. Default sortIndex is (column-index+1)*100 (first column = 100). sortIndex can be set to alter the order.
        sortDefault         : [string or boolean]. false. Possible values = false, true, "asc" or "desc". true => "asc"
        updateAfterSorting  : BOOLEAN false. If true and createContent is given the content of the coumun is updated after the tabel has been sorted
        getSortContent      : function(content) return the part of content to be used when sorting. optional
        sortHeader          : BOOLEAN false. If true a header-row is added every time the sorted value changes

        minimizable         : BOOLEAN false. If true the column can be minimized/maximized by clicking the header
        minimized           : BOOLEAN false. Default state of minimizable column
        minimizedIcon       : STRING or true. The icon shown when the column is minimized. default = icon from header. True = Force default icon

        createHeaderContent: function(content, $span, sortBy) Create the content of a sort-group-heade insider $span. Optional

        filter       : function(rawValue, columnOptions) null. Return true if row is included based on single value

    }

    showHeader          BOOLEAN true
    verticalBorder      BOOLEAN true. When true vertical borders are added together with default horizontal borders
    noBorder            BOOLEAN false. When true no borders are visible
    hoverRow            BOOLEAN true. When true the row get hightlightet when hovered
    noPadding           BOOLEAN false. When true the vertical padding of all cells are 0px

    notFullWidth        BOOLEAN false. When true the table is not 100% width and will adjust to it content
    centerInContainer   BOOLEAN false. When true the table is centered inside its container. Normaally it require notFullWidth: true

    saveState           BOOLEAN false. When true the table will save the state of the column (sorting, hidden, minimized) and set the state agian when the table is displayed again

    selectable          BOOLEAN false
    selectedId          [string] "" id for selected row
    onChange            [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected   BOOLEAN false. If true it is allowed to un-select a selected row
    allowReselect       BOOLEAN false. If true the onChange is called when a selected item is reselected/clicked

    defaultColumnOptions: {}. Any of the options for columns to be used as default values

    rowClassName      : [] of STRING or function(rowIndex) return STRING. []. Get or return class-names for each row

    rowIsHighlighted     : [] of BOOLEAN or function(rowIndex) return BOOLEAN. []. Get or return true/false for each row
    rowIsSemiHighlighted : [] of BOOLEAN or function(rowIndex) return BOOLEAN. []. Get or return true/false for each row

    rowIsPrimary, rowIsSecondary, rowIsSuccess, rowIsDanger, rowIsWarning, rowIsInfo, rowIsLight, rowIsDark: BOOLEAN. Adds Bootstrap color-clases

    rowFilter         : function(rowData, rowId) null. Return true if row is to be included/shown. rowData = {id: value}



    Sorting is done by https://github.com/joequery/Stupid-Table-Plugin


*******************************************************************/

    /********************************************************************
    Add different sort-functions for moment-objects: (a,b) return a-b and extend
    string-sort to accept content-object = {da,en} or {text:{da,en}}
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

    $.extend( $.fn.stupidtable.default_sort_fns, {
        //'moment' = sort by moment
        'moment'     : momentSort,

        //'moment_date' - sort by date despide the time
        'moment_date': function (m1, m2){
            return momentSort(m1, m2, 'day');
        },

        //'moment_time' - sort by time despide ther date
        'moment_time': function (m1, m2){
            return momentSort(
                moment(m1).date(1).month(0).year(2000),
                moment(m2).date(1).month(0).year(2000)
            );
        },

        //Extend string-sort to include content-obj
        "string": function(a, b) {
            //Convert a and b to {text:...} and get only text-part
            a = $._bsAdjustIconAndText( a ).text;
            b = $._bsAdjustIconAndText( b ).text;

            //Translate a and b if they are {da,en}
            a = $.isPlainObject(a) ? i18next.sentence( a ) : a;
            b = $.isPlainObject(b) ? i18next.sentence( b ) : b;

            return a.toString().localeCompare(b.toString());
        },    });


    //Adjust default stupidtable-options (if any)
    $.extend( $.fn.stupidtable.default_settings, {

    });

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
            defaultColumnOptions: {},
            rowClassName        : [],

            stupidtable         : {}
        },

        defaultColumnOptions = {
            align               : 'left',
            verticalAlign       : 'middle',
            noWrap              : false,
            truncate            : false,
            fixedWidth          : false,
            sortBy              : 'string',
            sortable            : false,
            minimizable         : false,
            noHorizontalPadding : false,
            noVerticalPadding   : false
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
            .toggleClass('px-0', !!columnOptions.noHorizontalPadding )
            .toggleClass('py-0', !!columnOptions.noVerticalPadding );

        if (addWidth && columnOptions.width)
            $element.css({
                'width'    : columnOptions.width,
                'max-width': columnOptions.width
            });

        return $element;
    }


    /**********************************************************
    asModal - display the table in a modal-window with fixed header and scrolling content
    **********************************************************/
    $.BSASMODAL.BSTABLE = function( modalOptions = {}){
        const options = this.bsTableOptions;
        let $result;

        if (options.showHeader)
            this.$thead_tr = this.find('thead tr');

        const show = !!modalOptions.show;
        modalOptions.show = false,

        $result =
            $.bsModal(
                $.extend( modalOptions, {
                    scroll              : options.fullWidth ? 'horizontal' : true, //Full width set scroll to horizontal to avoid scroll shadow and add overflow-y: scroll in css
                    flexWidth           : true,
                    noVerticalPadding   : true,
                    noHorizontalPadding : options.fullWidth,
                    content             : this,
                    className           : options.fullWidth  ? 'overflow-y-scroll' : '',
                    onScroll            : options.showHeader ? function(event){ this.$thead_tr.toggleClass('scroll-top', event.target.scrollTop > 0); }.bind(this) : null,
                })
            );

        if (options.saveState || modalOptions.saveState)
            $result.on({
                'shown.bs.modal' : this.loadState.bind(this),
                'hidden.bs.modal': this.saveState.bind(this),
            });

        if (options.showHeader)
            this._toggleAllColumns();

        if (show)
            $result.show();

        return $result;
    };

    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( rowContent ){
            let options  = this.data(dataTableId),
                $tbody   = this.find('tbody').first(),
                $tr      = $('<tr/>').appendTo( $tbody ),
                rowIndex = $tbody.children('tr').length - 1;


            function getRowValue( id, defaultValue ){
                let opt = options[id];
                if (!opt)
                    return defaultValue;

                if ((typeof opt == 'string') || (typeof opt == 'boolean'))
                    return opt;

                if ($.isFunction(opt))
                    return opt(rowIndex, rowContent);

                if (Array.isArray(opt) && (opt.length > rowIndex))
                    return opt[rowIndex];

                return defaultValue;
            }

            function getRowClass( id, className ){
                return getRowValue( id, false ) ? className + ' ' : '';
            }

            let className =
                    getRowValue( 'rowClassName', '' ) + ' ' +
                    getRowClass( 'rowIsHighlighted',       'row-is-highlighted') +
                    getRowClass( 'rowIsHigh',              'row-is-highlighted') +
                    getRowClass( 'rowIsSemiHighlighted',   'row-is-semi-highlighted') +
                    getRowClass( 'rowIsSemiHigh',          'row-is-semi-highlighted') +

                    //Bootstrap bg-color classes
                    getRowClass('rowIsPrimary',     'table-primary') +
                    getRowClass('rowIsSecondary',   'table-secondary') +
                    getRowClass('rowIsSuccess',     'table-success') +
                    getRowClass('rowIsDanger',      'table-danger') +
                    getRowClass('rowIsWarning',     'table-warning') +
                    getRowClass('rowIsInfo',        'table-info') +
                    getRowClass('rowIsLight',       'table-light') +
                    getRowClass('rowIsDark',        'table-dark') +

                    '';

            $tr.addClass(className);


/*
            if (options.rowClassName.length){
                var rowIndex = $tbody.children('tr').length - 1;
                if (options.rowClassName.length > rowIndex)
                    $tr.addClass(options.rowClassName[rowIndex]);
            }
*/
            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);

            options.columns.forEach((columnOptions, index) => {
                var content = rowContent[columnOptions.id],
                    $td = $('<td/>').appendTo($tr);
                adjustThOrTd( $td, columnOptions, !options.showHeader );

                if ($.isPlainObject(content) && content.className)
                    $td.addClass(content.className);

                //Save original contant as sort-by-value
                $td.data('sort-value', columnOptions.getSortContent ?  columnOptions.getSortContent(content) : content );
                //If raw-value and sort-value are differnt => also save raw-value
                if (columnOptions.getSortContent)
                    $td.data('raw-value', content );

                //Build the content using the createContent-function, _bsAppendContent, or jquery-value-format
                this._createTdContent( content, $td, index );
            }, this);

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
        _createTdContent
        **********************************************************/
        _createTdContent: function( content, $td, columnIndex, createContent ){
            var columnOptions = this._getColumn(columnIndex);

            //Build the content using the given create-function, column.createContent-function, _bsAppendContent, or jquery-value-format
            var sortBy = this.lastSortBy.columnIndex == columnIndex ? this.lastSortBy.direction : false;
            if (createContent)
                createContent( content, $td, sortBy );
            else
                if (columnOptions.createContent)
                    columnOptions.createContent( content, $td, sortBy );
                    else
                        if (columnOptions.vfFormat)
                            $td.vfValueFormat( content, columnOptions.vfFormat, columnOptions.vfOptions );
                        else
                            $td._bsAppendContent( content );
        },

        /**********************************************************
        eachRow - Call rowFunc = function(rowOptions)  for all rows
        rowOptions = {
            id      : Row-id
            $tr     : tr-element
            $tdList : [] of td-elements

            valueList: [] of raw-value
            values   : {ID} of raw-value;

            sortValueList: [] of sort-value
            sortValues   : {ID} of sort-value;

            columns: All column of the table
        }
        **********************************************************/
        eachRow: function( rowFunc ){
            this.find('tbody tr').each( function( rowIndex, tr ){
                var $tr = $(tr),
                    id = $tr.attr('id'),
                    $tdList = [],
                    valueList = [],
                    values = {},
                    sortValueList = [],
                    sortValues = {};

                $tr.find('td').each(function(index, td){
                    var $td = $(td);
                    $tdList.push( $td );
                });

                //Find the "raw" content eq. before any display adjusting was made and the content used for sorting
                $tdList.forEach( function( $td, columnIndex ){
                    var column    = this._getColumn( columnIndex ),
                        sortValue = $td.data('sort-value'),
                        value     = column.getSortContent ? $td.data('raw-value') : sortValue;

                    valueList.push(value);
                    values[column.id] = value;

                    sortValueList.push(sortValue);
                    sortValues[column.id] = sortValue;

                }.bind(this));

                rowFunc({
                    id       : id,
                    $tr      : $tr,
                    $tdList  : $tdList,

                    valueList: valueList,
                    values   : values,

                    sortValueList: sortValueList,
                    sortValues   : sortValues,

                    columns: this.columns

                });
            }.bind(this));
            return this;
        },


        /**********************************************************
        showColumn, hideColumn,
        maximizeColumn, minimizeColumn,
        toggleColumn, toggleMinimizedColumn
        **********************************************************/
        showColumn: function(index){ return this.toggleColumn(index, true); },
        hideColumn: function(index){ return this.toggleColumn(index, false); },
        toggleColumn: function(index, show){
            return this._toggleColumn('hidden', index, show);
        },

        maximizeColumn: function(index){ return this.toggleMinimizedColumn(index, true); },
        minimizeColumn: function(index){ return this.toggleMinimizedColumn(index, false); },
        toggleMinimizedColumn: function(index, show){
            return this._toggleColumn('minimized', index, show);
        },


        _toggleColumn: function(id, index, show){
            this.columns[index][id] = typeof show == 'boolean' ? show : !this.columns[index][id];
            this._toggleAllColumns();
        },

        _toggleAllColumns: function(){
            /* Not needed
            let cssHeight = parseInt(this.$thead.css('min-height')),
                height = this.$thead.height();
            if (height > cssHeight)
                this.$thead.css('height', height+'px');
            */

            this.columns.forEach((columnOptions, index) => {
                //Toggle class-name for hidden and minimized column
                this.toggleClass('hideColumnIndex'+index,      !!columnOptions.hidden);
                this.toggleClass('minimizedColumnIndex'+index, !!columnOptions.minimized);
            }, this );
        },


        /**********************************************************
        getState setState - get/set sort, hidden, minimized columns
        loadState, saveState - load/save current setting internally
        **********************************************************/
        getState: function(){
            let result = [];
            this.columns.forEach( colOptions => {
                result.push({
                    id          : colOptions.id,
                    hidden      : !!colOptions.hidden,
                    minimizable : !!colOptions.minimizable,
                    minimized   : !!colOptions.minimized,
                    sortBy      : this.lastSortBy.columnIndex == colOptions.index ? this.lastSortBy.direction : false,
                    sortable    : !!colOptions.sortable,
                });
            });
            return result;
        },


        setState: function( columnState ){
            if (columnState)
                columnState.forEach( stateOptions => {
                    let col = this._getColumn( stateOptions.id );
                    if (col){
                        ['hidden', 'minimizable', 'minimized', 'sortable'].forEach( id => col[id] = stateOptions[id] );

                        if (stateOptions.sortBy)
                            this.sortBy(col.index, stateOptions.sortBy);
                    }
                }, this);

            this._toggleAllColumns();

            return this;
        },


        loadState: function(){
            if (this.savedState)
                this.setState( this.savedState );
        },

        saveState: function(){
            this.savedState = this.getState();
        },


        /**********************************************************
        sortBy - Sort the table
        **********************************************************/
        sortBy: function( idOrIndex, dir ){
            var column = this._getColumn(idOrIndex);
            if (column)
                column.$th.stupidsort( dir );
        },

        _resort: function(){
            this.sortBy( this.lastSortBy.columnIndex, this.lastSortBy.direction );
        },

        /**********************************************************
        beforeTableSort - Called before the table is being sorted by StupidTable
        **********************************************************/
        beforeTableSort: function(event, sortInfo){
            var column          = this._getColumn(sortInfo.column),
                sortMulticolumn = column.$th.attr('data-sort-multicolumn') || '';

            //Remove all group-header-rows
            this.find('.table-sort-group-header').remove();

            //Convert sortMulticolumn to array
            sortMulticolumn = sortMulticolumn ? sortMulticolumn.split(',') : [];
            sortMulticolumn.push(column.index);
        },

        /**********************************************************
        afterTableSort - Called after the table is being sorted by StupidTable
        **********************************************************/
        afterTableSort: function(event, sortInfo){
            this.lastSortBy = {
                columnIndex: sortInfo.column,
                direction  : sortInfo.direction
            };

            //Update all cells if column.options.updateAfterSorting == true
            var updateColumn = [],
                updateAnyColumn = false;

            this.columns.forEach( ( columnOptions, index ) => {
                updateColumn[index] = !!columnOptions.updateAfterSorting && !!columnOptions.createContent;
                updateAnyColumn = updateAnyColumn || updateColumn[index];
            });

            if (updateAnyColumn)
                this.eachRow( function(rowOptions){
                    updateColumn.forEach( function(opt, columnIndex){
                        if (opt){
                            var $td = rowOptions.$tdList[columnIndex];
                            $td.empty();

                            this._getColumn(columnIndex).createContent(
                                rowOptions.valueList[columnIndex],
                                $td,
                                this.lastSortBy.columnIndex == columnIndex ? this.lastSortBy.direction : false
                            );
                        }
                    }.bind(this));
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

                var lastHeaderContent = "Denne her text kommer sikkert ikke igen";

                this.find('tbody tr:not(.filter-out) td:nth-child(' + (sortInfo.column+1) +')').each( function( index, td ){
                    var $td = $(td),
                        nextHeaderContent = column.getSortContent ? $td.data('raw-value') : $td.data('sort-value');

                    if (column.getHeaderContent)
                        nextHeaderContent = column.getHeaderContent(nextHeaderContent);

                    if (!$._isEqual(nextHeaderContent, lastHeaderContent)){

                        //Create a clone of $tdBase and 'copy' all children from $td to $newTd
                        var $newTd = $tdBase.clone(true),
                            $span = $('<span/>').appendTo($newTd);

                        this._createTdContent( nextHeaderContent, $span/*$newTd*/, column.index, column.createHeaderContent );

                        //Create new row and insert before current row
                        $('<tr/>')
                            .addClass('table-sort-group-header')
                            .append( $newTd )
                            .insertBefore( $td.parent() );

                        lastHeaderContent = nextHeaderContent;
                    }
                }.bind(this));
            }
        },

        /**********************************************************
        resetFilterTable
        **********************************************************/
        resetFilterTable: function(dontSort){
            this.find('tbody tr').removeClass('filter-out');
            if (!dontSort)
                this._resort();
            return this;
        },

        /**********************************************************
        filterTable -
        **********************************************************/
        filterTable: function( rowF, columnF ){
            let options = $(this).data(dataTableId),
                rowFilter = rowF || options.rowFilter,
                columnFilter = {};

            this.resetFilterTable(true);

            //Setting columnFilter = columnF OR columnOptions[].filter
            if (columnF)
                columnFilter = columnF;
            else
                $.each(this.columnIds, function(id, opt){
                    if (opt.filter)
                        columnFilter[id] = opt.filter;
                });


            this.eachRow( function( opt ){
                var result = true; //Included
                if (rowFilter)
                    //Row filter always before column-filter
                    result = rowFilter(opt.values, opt.id ); //<- HER: Måske nyt navn i stedet for values
                else {
                    $.each(columnFilter, function(id, filterFunc){
                        if (!filterFunc(opt.values[id], this._getColumn(id))){ //<- HER: Måske nyt navn i stedet for values
                            result = false;
                            return false;
                        }
                    }.bind(this));
                }
                opt.$tr.toggleClass('filter-out', !result);
            }.bind(this));

            //Sort table again
            this._resort();

            return this;
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

        //Fixed first column only needed when horizontal scrolling ( = full width)
        options.firstColumnFixed = options.firstColumnFixed && options.fullWidth;

        options.class =
            'jb-table ' +
            (options.verticalBorder && !options.noBorder ? 'table-bordered ' : '' ) +
            (options.noBorder ? 'table-borderless ' : '' ) +
            (options.hoverRow ? 'table-hover ' : '' ) +
            (options.noPadding ? 'table-no-padding ' : '' ) +
            (options.fullWidth ? 'table-full-width ' : '' ) +
            (options.notFullWidth ? 'table-not-full-width ' : '' ) +
            (options.firstColumnFixed ? 'table-first-column-fixed ' : '' ) +
            (options.centerInContainer ? 'mx-auto my-0 ' : '' ) +
            (options.selectable ? 'table-selectable ' : '' ) +
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' );

        //Adjust each column
        var columnIds = {};

        options.columns.forEach( ( columnOptions, index ) => {
            let titlePost = null;

            columnOptions.sortable = columnOptions.sortable || columnOptions.sortBy;
            columnOptions = $.extend( true,
                {
                    index    : index,
                    sortIndex: (index+1)*100
                },
                defaultColumnOptions,
                options.defaultColumnOptions || options.defaultColunmOptions, //Bug fix: Spelling error
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

            if (columnOptions.sortable)
               titlePost = {da:'(Klik: Sortér)', en:'(Click to sort)'};


            //If column is not sortable and have options minimizable the column can be minimized
            if (options.showHeader && !columnOptions.sortable && columnOptions.minimizable) {
                columnOptions.minimizable = true;

                let minIcon = 'fa-left-right',
                    colIcon = (columnOptions.header && columnOptions.header.icon) ? columnOptions.header.icon : null;
                if (columnOptions.minimizedIcon !== true)
                    minIcon = columnOptions.minimizedIcon || colIcon || minIcon;

                columnOptions.minimizedIcon = minIcon;

                titlePost = {da:'(Klik: min/maksimere)', en:'(Click to min/maximize)'};
            }

            if (titlePost){
                let title = {},
                    titleFound = false;

                [columnOptions.title, columnOptions.header].forEach( newTitle => {
                    if (newTitle && !titleFound){
                        /*
                        newTitle = STRING
                        newTitle = {text: STRING}
                        newTitle = {text: {da:, en:STRING}
                        */
                        titleFound = true;
                        if (typeof newTitle == 'string')
                            title.da = newTitle;
                        else
                            if (newTitle.text){
                                if (typeof newTitle.text == 'string')
                                    title.da = newTitle.text;
                                else
                                    title = $.extend({}, newTitle.text);
                            }

                        title = $._bsAdjustText(title);
                    }
                });

                $.each( titlePost, (lang, text) => {
                    title[lang] = (title[lang] || '') + ' ' + text;
                    title[lang] = title[lang].replace('<br>', ' - ');
                });
                columnOptions.title = title;
            }


        });

        var id = 'bsTable'+ tableId++,
            $table = $('<table/>')
                        .addClass('BSTABLE')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id': id
                        }),
            $thead = $table.$thead = $('<thead/>')
                        .toggleClass('no-header', !options.showHeader )
                        .appendTo( $table ),
            $tr = $('<tr/>')
                    .appendTo( $thead );

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

        $table.columns = options.columns;
        $table.columnIds = columnIds;

        $table.bsTableOptions = options;

        //Create colgroup
        var $colgroup = $('<colgroup/>').appendTo($table);
        options.columns.forEach( columnOptions => {
            var $col = $('<col/>').appendTo( $colgroup );
            if (columnOptions.fixedWidth)
                $col.attr('width', '1');
        });

        var sortableTable  = false,
            sortDefaultId  = '',
            sortDefaultDir = 'asc',
            multiSortList  = [];

        $table.lastSortBy = {};

        /* From https://github.com/joequery/Stupid-Table-Plugin:
            "A multicolumn sort allows you to define secondary columns to sort by in the event of a tie with two elements in the sorted column.
                Specify a comma-separated list of th identifiers in a data-sort-multicolumn attribute on a <th> element..."

            multiSortList = []{columnIndex, sortIndex} sorted by sortIndex. Is used be each th to define alternative sort-order
        */
        options.columns.forEach( ( columnOptions, index ) => {
            if (columnOptions.sortable)
                multiSortList.push( {columnId: columnOptions.id, columnIndex: ''+index, sortIndex: columnOptions.sortIndex });
        });
        multiSortList.sort(function( c1, c2){ return c1.sortIndex - c2.sortIndex; });

        //Create headers
        if (options.showHeader)
            $table.columns.forEach( (columnOptions, columnIndex) => {
                let $th = columnOptions.$th = $('<th/>').appendTo( $tr );

                if (columnOptions.minimizable){
                    $th
                        .addClass('minimizable clickable')
                        ._bsAddHtml( {icon: columnOptions.minimizedIcon, iconClass: 'show-for-minimized'} )
                        .on('click', $table.toggleMinimizedColumn.bind($table, columnIndex) );
                }


                if (columnOptions.sortable){
                    $th
                        .addClass('sortable clickable')
                        .attr('data-sort', columnOptions.sortBy);

                    if (columnOptions.sortDefault){
                        sortDefaultId  = columnOptions.id;
                        sortDefaultDir = columnOptions.sortDefault == 'desc' ? 'desc' : sortDefaultDir;
                    }

                    //Create alternative/secondary columns to sort by
                    var sortMulticolumn = '';
                    multiSortList.forEach( multiSort => {
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

                        $th.attr('data-sort-multicolumn', sortMulticolumn);
                    }
                    sortableTable = true;
                }

                if (columnOptions.title)
                    $th.i18n(columnOptions.title, 'title');

                adjustThOrTd( $th, columnOptions, true );

                $th._bsAddHtml( columnOptions.header );
            }, this);

        if (options.selectable){
            var radioGroupOptions = $.extend( true, {}, options );
            radioGroupOptions.className = 'table-selected';
            options.radioGroup = $.radioGroup( radioGroupOptions );
        }

        $table.data(dataTableId, options);


        //Create tbody and all rows
        $table.append( $('<tbody/>') );

        options.content.forEach( rowContent => $table.addRow( rowContent ) );

        if (sortableTable){
            $table.stupidtable( options.stupidtable )
                .bind('beforetablesort', $table.beforeTableSort.bind( $table ) )
                .bind('aftertablesort',  $table.afterTableSort.bind( $table ) );

            if (sortDefaultId, sortDefaultDir)
                $table.sortBy(sortDefaultId, sortDefaultDir);
        }

        $table._toggleAllColumns();

        return $table;
    };

}(jQuery, this.i18next, this, document));