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
        this.options = options;
        this.modalForm = modalForm;
        this.options.userId = this.options.id;
        this.options.id = 'bsInputId' + inputId++;
    }

    BsModalInput.prototype = {
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
        getSelectpicker
        *******************************************************/
        getSelectpicker: function(){
            this.selectpicker = this.selectpicker || this.getElement().data('selectpicker').selectpicker;
            return this.selectpicker;
        },

        /*******************************************************
        getRadioGroup
        *******************************************************/
        getRadioGroup: function(){
            this.radioGroup = this.radioGroup || this.getElement().data('radioGroup');
            return this.radioGroup;
        },

        /*******************************************************
        getFormGroup
        *******************************************************/
        getFormGroup: function(){
            this.$formGroup = this.$formGroup || this.getElement().parents('.form-group').first();
            if (!this.$formGroup.length)
                this.$formGroup = this.getElement();
            return this.$formGroup;
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(value, validate){
            var $elem = this.getElement();
            switch (this.options.type || 'input'){
                case 'input'            : $elem.val( value );                      break;
                case 'select'           : $elem.selectpicker('val', value );       break;
                case 'checkbox'         :
                    //Special case: If value is a string => the checkbox get semi-selected mode (yellow background)
                    var isSemiSelected = (typeof value == 'string');
                    $elem.toggleClass('semi-selected', isSemiSelected);

                    //Update options for the checkbox
                    var options = $elem.data('cbx_options');
                    options.className_semi = isSemiSelected ? 'semi-selected' : '';
                    options.semiSelectedValue = isSemiSelected ? value : '';
                    $elem.data('cbx_options', options );

                    $elem.prop('checked', value );
                    break;

                case 'selectlist'       : this.getRadioGroup().setSelected(value); break;
                case 'radiobuttongroup' : this.getRadioGroup().setSelected(value); break;

                case 'slider'           :
                case 'timeslider'       : this.getSlider().setValue( value );      break;
                case 'text'             :                                          break;
                case 'hidden'           : $elem.val( value );                      break;
            }
            this.onChanging();
            return validate ? this.validate() : this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            var result = null;
            switch (this.options.type || 'input'){
                case 'input'            : result = '';    break;
                case 'select'           : result = null;  break;
                case 'checkbox'         : result = false; break;
                case 'selectlist'       : result = this.getRadioGroup().options.list[0].id; break;
                case 'radiobuttongroup' : result = this.getRadioGroup().options.list[0].id; break;

                case 'slider'           :
                case 'timeslider'       : result = this.getSlider().result.min; break;
                case 'text'             : result = '';                          break;
                case 'hidden'           : result = '';                          break;
            }
            return result;
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            this.modalForm._resetInputValidation( this );
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
                case 'input'            : result = $elem.val();               break;
                case 'select'           : result = $elem.selectpicker('val'); break;
                case 'checkbox'         :
                    result = !!$elem.prop('checked');

                    //Special case: If $elem is semi-selected: return special value from option
                    var options = $elem.data('cbx_options');
                    if (result && options.semiSelectedValue && options.className_semi && $elem.hasClass(options.className_semi))
                        result = options.semiSelectedValue;

                    break;

                case 'selectlist'       : result = this.getRadioGroup().getSelected(); break;
                case 'radiobuttongroup' : result = this.getRadioGroup().getSelected(); break;
                case 'slider'           :
                case 'timeslider'       : result = this._getSliderValue(); break;
                case 'text'             : result = ' ';                    break;
                case 'hidden'           : result = $elem.val();            break;
            }
            return result === null ? this.getResetValue() : result;
        },

        /*******************************************************
        addValidation - Add the validations
        *******************************************************/
        addValidation: function(){
            this.modalForm._addInputValidation( this );
        },

        /*******************************************************
        validate
        *******************************************************/
        validate: function(){
            this.modalForm._validateInput( this );
            return this;
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
                    this.getFormGroup().toggleClass('d-none', !show);
                else
                    //When the element is invisible: Use visibility:hidden to keep structure of form and it elements
                    this.getFormGroup().css('visibility', show ? 'visible' : 'hidden');

                this.getElement().prop('disabled', !show);

                this.modalForm._enableInputValidation( this, show );
            }
            return this;
        },
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
        this.options.onClose = $.proxy( this.onClose, this );

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var types = ['button', 'input', 'select', 'selectlist', 'radiobuttongroup', 'checkbox', 'radio', 'table', 'slider', 'timeslider', 'hidden', 'inputgroup'];

        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && (types.indexOf(obj.type) >= 0) && obj.id){
                var bsModalInput = new BsModalInput( obj, _this ),
                    onChangingFunc = $.proxy( bsModalInput.onChanging, bsModalInput );

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
        this.$form = $('<form/>');
        if (this.options.extended && this.options.useExtended){
            this.$form._bsAppendContent( this.options.extended.content, this.options.contentContext );
            this.options.extended.content = this.$form;
        }
        else {
            this.$form._bsAppendContent( this.options.content, this.options.contentContext );
            this.options.content = this.$form;
        }

        if (this.options.formValidation)
            this.$form.addClass('form-validation');

        //Create the modal
        this.$bsModal = $.bsModal( this.options );

        //Append the hidden submit-button the the form
        this.$form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];

        //Add the validator
        this._addValidation();

        //Add the validations
        this._eachInput( function( input ){
            input.addValidation();
        });

        //Add onSubmit
        this._addOnSubmit( $.proxy(this.onSubmit, this) );

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
        edit: function( values, tabIndexOrId ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, false, true );
            this.originalValues = this.getValues();

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );
            this._resetValidation();

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

            var _this = this,
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
        _addOnSubmit (*)
        *******************************************************/
        _addOnSubmit: function( onSubmitFunc ){
            this.$form.on('submit', onSubmitFunc );
        },

        /*******************************************************
        _addValidation (*)
        *******************************************************/
        _addValidation: function(){
        },

        /*******************************************************
        _resetValidation (*)
        *******************************************************/
        _resetValidation: function(){
        },

        /*******************************************************
        _addInputValidation (*)
        *******************************************************/
        _addInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _validateInput (*)
        *******************************************************/
        _validateInput: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _resetInputValidation (*)
        *******************************************************/
        _resetInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _enableInputValidation (*)
        *******************************************************/
        _enableInputValidation: function( /*bsModalInput, enabled*/ ){
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
        setValues: function(values, validate, restUndefined){
            this._eachInput( function( input ){
                var value = values[input.options.userId];
                if ( value != undefined)
                    input.setValue(value, validate);
                else
                    if (restUndefined)
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
            this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;

            this.$bsModal._close();
            this.options.onClose_user();

            event.preventDefault();
            return false;
        },

    };
}(jQuery, this, document));

