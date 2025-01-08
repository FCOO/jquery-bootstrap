/****************************************************************************
	jquery-bootstrap-form.js

	(c) 2018, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    var formId = 0,
        inputId = 0;


    var defaultOptions = {
            content       : '',
            show          : false,
            closeText     : {da:'Annullér', en:'Cancel'},
            submitIcon    : 'fa-check',
            submitText    : {da:'Ok', en:'Ok'},
            buttons       : [],     //Extra button between
            static        : true,   //Only close modal-form on (X)
            formValidation: false,  //When true: make room for formValidation messages
            closeWithoutWarning: false, //When true the form can close without warning for not-saved changes
        };


    //BsModalinput = internal object representing an input-element in the form
    function BsModalInput( options, modalForm ){
        options.items = options.items || options.list;
        options.list = options.list || options.items;

        this.options = options;
        this.modalForm = modalForm;
        this.options.userId = this.options.id;
        this.options.id = 'bsInputId' + inputId++;
    }


    /*******************************************************
    Export to jQuery
    *******************************************************/
    $.BsModalInput = BsModalInput;
    $.bsModalInput = function( options ){
        return new $.BsModalInput( options );
    };

    $.BsModalInput.prototype = {
        /*******************************************************
        getElement
        *******************************************************/
        getElement: function(){
            this.$element = this.$element || this.modalForm.$form.find( '#'+ this.options.id );
            return this.$element;
        },

        /*******************************************************
        getSlider
        *******************************************************/
        getSlider: function(){
            this.slider = this.slider || this.getElement().data('slider');
            return this.slider;
        },

        /*******************************************************
        getRadioGroup
        *******************************************************/
        getRadioGroup: function(){
            this.radioGroup = this.radioGroup || this.getElement().data('radioGroup');
            return this.radioGroup;
        },

        /*******************************************************
        getInputGroupContainer
        getFormGroup for backward combatibility
        *******************************************************/
        getInputGroupContainer: function(){
             this.$formGroup = this.$formGroup || this.getElement().parents('.input-group-container').first();
            if (!this.$formGroup.length)
                this.$formGroup = this.getElement();
            return this.$formGroup;
        },
        getFormGroup: function(){
            return this.getInputGroupContainer();
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(value){
            var $elem = this.getElement(),
                isSemiSelected;

            //Special case: If it is a element with possible semi-selected value and vaule is a string/array => the element get semi-selected mode (yellow background)
            if (this.canBeSemiSelected){
                var semiSelectedValue;

                isSemiSelected = ($.type(value) == this.semiSelectedValueType);
                if ((isSemiSelected && this.semiSelectedValueType == 'array')){
                    semiSelectedValue = value[1];
                    value             = value[0];
                }
                else
                    semiSelectedValue = value;
            }

            switch (this.options.type || 'input'){
                case 'input'   :
                case 'select'  : $elem.val( value );                break;

                case 'checkbox': $elem.prop('checked', value );     break;

                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : $elem._cbxSet(value, true, isSemiSelected, semiSelectedValue); break;

                case 'selectlist'  : this.getRadioGroup().setSelected(value); break;

                case 'selectbutton': $elem._bsSelectButton_setValue( value ); break;

                case 'radiobuttongroup': this.getRadioGroup().setSelected(value, false, isSemiSelected, semiSelectedValue); break;

                case 'slider'    :
                case 'timeslider': this.getSlider().setValue( value );  break;
                case 'text'      :                                      break;
                case 'hidden'    : $elem.val( value );                  break;
            }
            this.onChanging();
            return this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            var result;
            switch (this.options.type || 'input'){
                case 'input'            : result = '';    break;
                case 'select'           :
                case 'selectbutton'     : result = null;  break;

                case 'checkbox'              :
                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : result = false; break;

                case 'selectlist'       :
                case 'radiobuttongroup' : result = this.getRadioGroup().options.list[0].id; break;

                case 'slider'           :
                case 'timeslider'       : result = this.getSlider().result.min; break;

                case 'text'             :
                case 'hidden'           : result = '';                          break;

                default                 : result = false;
            }
            return result;
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            if (!onlyResetValidation)
                return this.setValue( this.getResetValue() );
        },

        /*******************************************************
        _getSliderValue
        *******************************************************/
        _getSliderValue: function(){
            return this.getSlider().result.value;
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(){
            var $elem = this.getElement(),
                result = null;

            switch (this.options.type || 'input'){
                case 'input'   :
                case 'select'  : result = $elem.val();                    break;

                case 'checkbox': result = !!$elem.prop('checked');        break;

                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : result = !!$elem._cbxGet();              break;

                case 'selectlist'       : result = this.getRadioGroup().getSelected();  break;
                case 'radiobuttongroup' : result = this.getRadioGroup().getSelected();  break;

                case 'selectbutton'     : result = $elem._bsSelectButton_getValue(); break;


                case 'slider'    :
                case 'timeslider': result = this._getSliderValue();              break;

                case 'text'      : result = ' ';                                 break;
                case 'hidden'    : result = $elem.val();                         break;
            }

            return result === null ? this.getResetValue() : result;
        },

        /*******************************************************
        onChanging
        *******************************************************/
        onChanging: function(){
            if (this.modalForm.isCreated){
                this.modalForm.showOrHide( this );
                this.modalForm.onChanging();
            }
        },

        /*******************************************************
        showOrHide
        Show or hide the input if any of the id:value in options.showWhen or hideWhen exists
        *******************************************************/
        showOrHide: function( values ){
            if (this.options.showWhen || this.options.hideWhen){
                var show = !this.options.showWhen; //If showWhen is given default is false = not show
                $.each( this.options.hideWhen || {}, function( userId, hideValue ){
                    var value = values[userId];
                    if ( ( $.isArray(hideValue) && (hideValue.indexOf(value) != -1)) ||
                         (!$.isArray(hideValue) && (hideValue == value))
                       )
                        show = false;
                });
                $.each( this.options.showWhen || {}, function( userId, showValue ){
                    var value = values[userId];
                    if ( ( $.isArray(showValue) && (showValue.indexOf(value) != -1)) ||
                         (!$.isArray(showValue) && (showValue == value))
                       )
                        show = true;
                });

                //Reset the validation if the field is hidden
                if (!show){
                    this.getElement().prop('disabled', false);
                    this.resetValue( true );
                }

                if (this.options.freeSpaceWhenHidden)
                    //When the element is invisible: Use display:none
                    this.getInputGroupContainer().toggleClass('d-none', !show);
                else
                    //When the element is invisible: Use visibility:hidden to keep structure of form and it elements
                    this.getInputGroupContainer().css('visibility', show ? 'visible' : 'hidden');

                this.getElement().prop('disabled', !show);
            }
            return this;
        }
    }; //End of BsModalInput.prototype


    /************************************************************************
    *************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content Samer as content for bsModal with extention of
            id = STRING
            showWhen and hideWhen = [id] of value: hide or show element when another element with id has value
            freeSpaceWhenHidden = BOOLEAN, when true the element will not appear in the form when it is hidden (as display: none). If false the space is allocated to the hidden element (as visibility: hidden)

        extended.content: Same as options.content, but NOT BOTH
        useExtended: false - When true the extended.content is used as the content of the form
        onChanging: function( values ) - called when the value of any of the elements are changed
        onSubmit  : function( values ) - called when the form is submitted
    *************************************************************************
    ************************************************************************/
    function BsModalForm( options ){
        var _this = this;
        this.options = $.extend(true, {}, defaultOptions, options );
        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        this.options.onClose_user = this.options.onClose || function(){};
        this.options.onShow = $.proxy( this.onShow, this );
        this.options.onClose = $.proxy( this.onClose, this );

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var typeList = ['button', 'checkboxbutton', 'standardcheckboxbutton', 'iconcheckboxbutton',
                        'input', 'select', 'selectlist', 'selectbutton', 'radiobuttongroup', 'checkbox', 'radio', 'table', 'slider', 'timeslider', 'hidden', 'inputgroup', 'formControlGroup'],

            //semiSelectedValueTypes = {TYPE_ID:TYPE} TYPE_ID = the types that accept a semi-selected value. TYPE = the $.type result that detect if the value of a element is semi-selected
            semiSelectedValueTypes = {
                checkboxbutton          : {type: 'string' },
                standardcheckboxbutton  : {type: 'string' },
                checkbox                : {type: 'string' },
                radiobuttongroup        : {type: 'array',   addSemiSelectedClassToChild: true }
            };

        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && typeList.includes(obj.type) && obj.id){
                var bsModalInput = new BsModalInput( obj, _this ),
                    onChangingFunc = $.proxy( bsModalInput.onChanging, bsModalInput ),
                    ssvt = semiSelectedValueTypes[obj.type];

                var canBeSemiSelected = bsModalInput.canBeSemiSelected = !!ssvt;
                bsModalInput.semiSelectedValueType       = canBeSemiSelected ? ssvt.type                        : null;
                bsModalInput.addSemiSelectedClassToChild = canBeSemiSelected ? ssvt.addSemiSelectedClassToChild : null;

                //Set options to call onChanging
                switch (obj.type){
                    case 'slider'    :
                    case 'timeslider': obj.onChanging = onChangingFunc; break;
                    default          : obj.onChange = onChangingFunc;
                }

                //Add element to inputs
                _this.inputs[obj.id] = bsModalInput;
            }
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        }


        if (this.options.extended && this.options.useExtended)
            setId( 'dummy', this.options.extended);
        else
            setId( 'dummy', this.options.content);

        //Create a hidden submit-button to be placed inside the form
        var $hiddenSubmitButton = this.$hiddenSubmitButton = $('<button type="submit" style="display:none"/>');

        //Add submit-button
        this.options.buttons.push({
            icon     : this.options.submitIcon,
            text     : this.options.submitText,
            className: 'primary min-width',
            focus    : true,
            onClick  : function(){ $hiddenSubmitButton.trigger('click'); }
        });

        this.options.show = false; //Only show using method edit(...)

        //Create the form
        var $form = this.$form = $('<form novalidate/>');
        if (this.options.extended && this.options.useExtended){
            $form._bsAppendContent( this.options.extended.content, this.options.contentContext, null, this.options );
            this.options.extended.content = $form;
        }
        else {
            $form._bsAppendContent( this.options.content, this.options.contentContext, null, this.options );
            this.options.content = $form;
        }

        //Create the modal
        this.$bsModal = $.bsModal( this.options );

        //Append the hidden submit-button the the form
        $form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];


        //Add the validations
        this._eachInput( function( input ){
            if (input.options.validators){
                input.addValidation();
                $form.addClass('needs-validation form-validation');
            }
        });

        //Add onSubmit
        $form.on('submit', $.proxy(this.onSubmit, this) );

        return this;
    }

    /*******************************************************
    Export to jQuery
    *******************************************************/
    $.BsModalForm = BsModalForm;
    $.bsModalForm = function( options ){
        return new $.BsModalForm( options );
    };

    /*******************************************************
    Extend the prototype
    Methods marked with (*) are (almost) empty and must be defined
    with the used validator
    *******************************************************/
	$.BsModalForm.prototype = {

        /*******************************************************
        edit
        *******************************************************/
        edit: function( values, tabIndexOrId, semiSelected ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, true, semiSelected );
            this.originalValues = this.getValues();

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );

            this.showOrHide( null );
            this.isCreated = true;
            this.onChanging();
        },

        /*******************************************************
        isDifferent( values ) - retur true if values is differnet from this.getValues()
        *******************************************************/
        isDifferent: function( values ){
            //Check if any of the new values are different from the original ones
            var newValues = this.getValues(),
                result = false;

            $.each( newValues, function(id, value){
                if (!values.hasOwnProperty(id) || (values[id] != value)){
                    result = true;
                    return false;
                }
            });

            return result;
        },

        /*******************************************************
        onShow
        *******************************************************/
        onShow: function(){
            this.$form.removeClass('was-validated');
        },

        /*******************************************************
        onClose
        *******************************************************/
        onClose: function(){
            //Check if any of the new values are different from the original ones
            if (!this.isDifferent(this.originalValues)){
                this.options.onClose_user();
                return true;
            }

            if (this.options.closeWithoutWarning){
                this.originalValues = this.getValues();
                if (this.options.onCancel)
                    this.options.onCancel(this.originalValues);
                return true;
            }

            let _this = this,
                noty = $.bsNoty({
                    type     : 'info',
                    modal    : true,
                    layout   :'center',
                    closeWith:['button'],
                    force    : true,
                    textAlign: 'center',
                    text     : {da:'Skal ændringeren gemmes?', en:'Do you want to save the changes?'},
                    buttons  : [
                        {
                            text: defaultOptions.closeText,
                            onClick: function(){
                                noty.close();
                            }
                        },
                        {
                            text:{da:'Gem ikke', en:'Don\'t Save'},
                            onClick: function(){
                                if (_this.options.onCancel)
                                    _this.options.onCancel(_this.originalValues);
                                _this.originalValues = _this.getValues();
                                noty.on('afterClose', function(){ _this.$bsModal.close(); });
                                noty.close();
                            }
                        },
                        {
                            text:{da:'&nbsp;&nbsp;&nbsp;&nbsp;Gem&nbsp;&nbsp;&nbsp;&nbsp;', en:'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Save&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'},
                            onClick: function(){
                                noty.on('afterClose', function(){ _this.$hiddenSubmitButton.trigger('click'); });
                                noty.close();
                            }
                        }
                    ]
                });
            return false;
        },


        /*******************************************************
        _eachInput
        *******************************************************/
        _eachInput: function( func ){
            $.each( this.inputs, function( id, input ){
                func( input );
            });
        },

        /*******************************************************
        getInput(id or userId)
        *******************************************************/
        getInput: function(id){
            var result = this.inputs[id];
            if (!result)
                this._eachInput( function( input ){
                    if (input.options.userId == id){
                        result = input;
                        return false;
                    }
                });
            return result;
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(id, value){
            return this.inputs[id] ? this.inputs[id].setValue( value ) : null;
        },

        /*******************************************************
        setValues
        *******************************************************/
        setValues: function(values, resetUndefined){
            this._eachInput( function( input ){
                var value = values[input.options.userId];
                if ( value != undefined)
                    input.setValue(value);
                else
                    if (resetUndefined)
                        input.resetValue();
            });
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(id){
            return this.inputs[id] ? this.inputs[id].getValue() : null;
        },

        /*******************************************************
        getValues
        *******************************************************/
        getValues: function(){
            var result = {};
            this._eachInput( function( input ){ result[input.options.userId] = input.getValue(); });
            return result;
        },

        /*******************************************************
        showOrHide - call showOrHide for all inputs except excludeInput
        *******************************************************/
        showOrHide: function( excludeInput ){
            var values = this.getValues();
            this._eachInput( function( input ){
                if (input !== excludeInput)
                    input.showOrHide( values );
            });
        },

        /*******************************************************
        onChanging = called every any of the element is changed
        *******************************************************/
        onChanging: function(){
            //Test if values used in last event-fire is different from current values
            if (this.isCreated && this.options.onChanging && this.isDifferent(this.onChangingValues || {})) {
                this.onChangingValues = this.getValues();
                this.options.onChanging( this.onChangingValues );
            }
        },

        /*******************************************************
        onSubmit = called when the form is valid and submitted
        *******************************************************/
        onSubmit: function( event/*, data*/ ){
            var form = this.$form.get(0);
            if (form.checkValidity()) {
                this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;
                this.$bsModal._close();
                this.options.onClose_user();
                event.preventDefault();
            }
            else {
                if (this.options.notyOnError)
                    window.notyError(
                        {da: 'Der er fejl i et eller flere felter', en: 'Error in one or more fields'},
                        {textAlign: 'center', layout: 'center', timeout: 3000}
                    );

                event.preventDefault();
                event.stopPropagation();
            }
            this.$form.addClass('was-validated');
            return false;
        },

    };  //end of $.BsModalForm.prototype
}(jQuery, this, document));

