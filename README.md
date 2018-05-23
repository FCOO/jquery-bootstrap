---
title: jquery-bootstrap
---
# jquery-bootstrap
>
[jquery-value-format]:https://github.com/fcoo/jquery-value-format
[i18next-phrases]:https://github.com/fcoo/i18next-phrases

## Description
This plugin contains jQuery methods to create different types of elements e.q. buttons, list, select, tables, modal windows etc. displayed in a adjusted version of Bootstrap 4 default theme

## Contents

- [Common](#common)
- [Button](#button)
- [Button-group](#buttongroup)
- [Radio-button-group](#radiobuttongroup)
- [Selectbox](#selectbox)
- [SelectList](#selectlist)
- [Radio and Checkbox](#radioandcheckbox)
- [Popover](#popover)
- [Button-group-popover](#buttongrouppopover)
- [SelectList-popover](#selectlistpopover)
- [Table](#table)
- [Accordion](#accordion)
- [Tabs](#tabs)
- [Modal](#modal)
- [Noty](#noty)
- [input](#input)

## Installation
### bower
`bower install https://github.com/fcoo/jquery-bootstrap.git --save`

## Demo
http://fcoo.github.io/jquery-bootstrap/demo/ 

<a name="common"></a>
## Common
There are some common options used for (almost) all types of elements

### Content 
`{icon, text, vfFormat, vfValue, vfOptions, link, onClick, textStyle, title }` or
`[] of {text, ..., title }`

#### `icon`
Can be a standard class-name for a icon-font packages (eg. Fontawesome) or a json-object used to build Fonawesome icons:

    {icon:"fa-home", data:{..}, attr:{..}, list:[
        {icon:"..",...},
        {icon:"..",...},
    ]}

#### `text`
- String - `{ text: "This is just a test" }`
- i18n `namespace:key` - `{ text: "myNamespace:myKey" }`
- [i18next-phrases]-object - `{lang1:"...", lang2:"...",...langN:"..."}`


    { icon:" fa-home", text: "With icon" }
    { icon:" fa-home", text: {da:"På dansk", en:"In English"} }

#### `vfFormat`, `vfValue`, and `vfOptions`
The content of a element can be set and updated using [jquery-value-format].
The options `vfFormat` and (optional) `vfOptions` defines witch format used to display the content `vfValue`

No formats are defined in this package (See examples at [fcoo-value-format](https://github.com/fcoo/fcoo-value-format))

#### `link` or `onClick`
`link` can be a url (string) or a function
`onClick` is always a function 

#### `textStyle`
Is a `string` or `object` with info on text-style for the element
Possible values: `primary secondary success danger warning info light dark left right center lowercase uppercase capitalize normal bold italic`

    { textStyle: "left capitalize" } //As string
    { textStyle: { left: true, capitalize: true} } //As object

#### `title`
Sets the DOM-element `title`. Same format as `text` 


### Array of content and `content` 
Simple elements can have the content-options direct together with other `id:values`:
`var myButton = $.bsButton( {id: "myButtonId", icon: "fa-car", text:{da:"Normalt", en: "Normal"} } );`

If the content-options are *alone* the content can also be an array of content. They will will be added with space between each record.

	header: [
		{ icon: "fa-home", text:{da: "Dansk", en:"English" },
		{ text: {da: "Link til noget", en:"Link to something"}, link:"http://mypage.com", textStyle:"italic" }
	]
    
To allow array of content for simple elements it is possible to use `options.content` with an array of content. 
`options.content` will overwrite all other content-options

    var myButton = $.bsButton({
                        id: "myButtonId", 
                        content: [{icon: "fa-bicycle"}, {icon:"fa-car"}, {icon:!"fa-fighter-jet"}]
                    });



### Element is selected
Use any of the following options
 `options.selected, options.checked, or options.active`

### `allowZeroSelected [Boolean] default = false`
If true it is allowed to deselect a selected child-element (e.q. in a radio-group)

### `allowReselect [Boolean] default = false`
If true the `onChange` is called when a selected item is reselected/clicked

### List/array of child-elements
Use any of the following options
 `options.list, options.buttons, options.items, or options.children`

### `context`
If `options.context` is given, ALL functions in `options` (eg. `onClick`, `text`, etc.) is called with `this=context`

<a name="button"></a>
## Button

    var myButton = $bsButton( options );

#### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | `""` | Id of the button |
| `selected` | `boolean` | `false` | If `true` the button is `selected` (blue) |
| `focus` | `boolean` | `false` | If `true` the button get focus |
| `primary` | `boolean` | `false` | If `true` the button get primary-class (blue) |
| `square` | `boolean` | `false` | If `true` the button get equal `height` and `min-width` (used primarily for icon-buttons) |
| `bigIcon` | `boolean` | `false` | If `true` the button get a almost 100% height icon (used primarily for icon-buttons) |
| `transparent` | `boolean` | `false` | If `true` the button get transparent and light text-color (assuming dark background) |
| `attr` | `object` | `null` | |
| `prop` | `object` | `null` | |
| `onClick` | `function()` | `null` | function to be called on-click |
| `content` | `content` or `[] of content` | `""` | See above |

#### Link-button

    var myLinkButton = $.bsLinkButton( options ); //Create a Bootstrap-button as a link

#### Checkbox-button

    var myCheckboxButton = $.bsCheckboxButton( options ); //See src/jquery-bootstrap-button.js for description

<a name="buttongroup"></a>
## Button-group

    var myButtopnGroup = $.bsButtonGroup( options );

| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `vertical` | `boolean` | `false` | `false`: Buttons side-by-side.  `true`: Buttons in list |
| `center` | `boolean` | `options.vertical`| Center-align then content of the buttons |
| `buttons` or `list` | `[] of button-options` | `[]`| Array of options for the buttons (See above) |

<a name="radiobuttongroup"></a>
## Radio-button-group

        var myButtopnGroup = $.bsRadioButtonGroup( options );

### options
Same as for Button-group plus
    
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | `""` | id for the group |
| `allowZeroSelected` | `boolean` | `false` | See above |
| `onChange` | `function(id, selected, $buttonGroup)` | `null` | Called when a button is selected |


<a name="selectbox"></a>
## Selectbox

    var mySelectbox = $.bsSelectbox( options );

### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `selectedId` | `string` | `null` | id of selected item |
| `placeholder` | `content` or `[] of content` | `""` | See above |
| `onChange` | `function(id, selected, $buttonGroup)` | `null` | Called when item is selected |
| `items` | `[] of itemOptions` | `[]` | The items and sub-headers |

#### itemOptions
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | `null` | Id of the item. If no id is given the item becomes a sub-header |
| `icon,text,..` | `content` | `""` | See above |
| `content` | `content` or `[] of content` | `null` | See above |

<a name="selectlist"></a>
## SelectList

    var mySelectList = $.bsSelectList( options );

### options

As for Selectbox without `placeholder`

<a name="radioandcheckbox"></a>
## Radio and Checkbox

	var myChackbox = $.bsCheckbox( options );

| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `checked` or `selected` | `boolean` | `false` | See above |
| `content` | `content` or `[] of content` | `null` | See above |
| `onChange` | `function(id, selected, $buttonGroup)` | `null` | Called when (de-)checked |
| `type` | `string` | `"checkbox"` | If `type:"radio"` the checkbox is displayed as a radio |

<a name="popover"></a>
## Popover

	var myPopover = $(selector).bsPopover( options );

### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `header` | `content` or `[] of content` | `""` | See above |
| `close` | `boolean` | `false` | Show close cross in header |
| `trigger` | `String` | `"click"` | How the popover is triggered - `"click"`, `"hover"`, `"focus"`, or `"manual"` |
| `vertical` | `boolean` | `false` | 
| `placement` | `String` | | `"top", "bottom", "left", "right"` Default = `"right"` for `vertical: false` and `"top"` for `vertical:true` |
| `closeOnClick` | `boolean` | `false` | If `true` the popover will close when it is clicked |
| `content` | | | The content of the popover. `function, DOM-element, jQuery-object` |
| `footer` | `content` or `[] of content` | `""` | See above |


<a name="buttongrouppopover"></a>
## Button-group-popover

	var myButtonGroupPopover = $(selector).bsButtonGroupPopover( options );

### options
Same as for [Popover](#popover) plus `center` and `list`/`buttons` as in [Button-group](#buttongroup)

<a name="selectlistpopover"></a>
## SelectList-popover

	var mySelectListPopover = $(selector).bsSelectListPopover( options );

### options 
Same as for [Popover](#popover) plus [SelectList](#selectlist) plus

 `syncHtml`: [Boolean] - update html of owner-element with html of selected item


<a name="table"></a>
## Table

    var myTable = $.bsTable( options );


#### Format of content
The content of individual cells are as described above.

To set common format all data in a column set the column-options `vfFormat` and `vfOptions`.


### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `showHeader` | `boolean` | `true` | Hide/Show the columns headers |
| `verticalBorder` | `boolean` | `true` | Show/hide header row |
| `selectable` | `boolean` | `false` | Allow row to be selected |
| `selectedId` | `string` | `""` | id for selected row |
| `onChange` | `function(id, selected, trElement)` | `null` | Called when a row is selected or deselected (if `options.allowZeroSelected == true`) |
| `allowZeroSelected` | `boolean` | `false` | See above. Not together with `allowReselect` |
| `allowReselect` | `boolean` | `false` | Allow a row to be selected when it is already selected. Not together with `allowZeroSelected` |
| `columns` | `[] of columnOptions` | `[]` | |
| `content` | `[] of contentOptions` | `[]` | |

#### columnOptions
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | Mandatory |  |
| `header` | `content` or `[] of content` | `""` | See above |
| `align` | `string` | `"left"` | `"left", "center", or "right"`. Text alignment for the column |
| `noWrap` | `boolean` | `false` | If `true` the column will not be wrapped = fixed width |
| `truncate` | `boolean` | `false` | If `true` the column will be truncated. Normally only one column get `truncate: true` **NOT IMPLEMENTED** |
| `sortable` | `boolean` | `false` | If `true` the column can be sorted. **NOT IMPLEMENTED** |
| `vfFormat` | `string` | `""` | See above |
| `vfOptions` | `object` | null | See above |
| `width` | `string` | null | The fixed width of the column |
| `noHorizontalPadding` | `boolean` | `false` | If `true` the horizontal padding of the cells in the column is zero |

#### contentOptions
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | `""` | Mandatory if the table has options `selecable: true`  |
| `[column-id]` | `content` or `[] of content` | `""` | See above |

Eq.

    columns: [ 
        {id: "first",...},..., 
        {id:'description'} 
    ], 
    content: [
        {
            first      : "My id",..., 
            description: {da:"Dansk beskrivelse", en:"English description"}
        },
        {
            first      : "My 2.id",..., 
            description: {da:"En anden dansk beskrivelse", en:"Another English description"}
        }
    ]

### Methods 

    .addRow(  rowContent ); //Add a row dynamically
    .asModal(  modalOptions ); //Return a bsModal (see below) with the table as content


<a name="accordion"></a>
## Accordion

    $myAccordion = $.bsAccordion( accordionChildOptions ); //accordionChildOptions.children must exists

### accordionChildOptions
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `header` | `content` or `[] of content` | `""` | See above |
| `multiOpen` | `boolean` | `false` | If `true` the different "children" can be open at the same time |
| `content` | `jQuery-object` / `DOM-element` / `function( $container )` | `""` | The content of the accordion-card |
| `children` (or `list`) | `[] of accordionChildOptions` | `null` | The children cards |
| `footer` | `content` or `[] of content` | `""` | See above |

### Methods

    .asModal(  modalOptions ); //Return a bsModal (see below) with the accordion as content
    .bsOpenCard( indexOrId ); //Open the card with index (integer) or id (string) == indexOrId


<a name="tabs"></a>
## Tabs

    $myTabs = $.bsTabs( options ); 

### options

| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `children` (or `list`) | `[] of tabOptions` | `null` | The tabs |
| `scroll` | `boolean` | `false` | Adds a scrollbar to the content |
| `height` | `string` | `null` | The fixed height of all content-containers |

### tabOptions
    

| Id | Type | Default | Description |
| :--: | :--: | :-----: | :--- |
| `id` | `string` | `""` |` `|
| `icon, text etc` | `content` or `[] of content` | `""` | See above |
| `content` | | | The contents for the tab.<br>Can be `DOM-element`, `jQuery-element`, `function( $container )` | | |  | 
| `footer` | `content` or `[] of content` | `""` | See above |


### Methods
    .asModal(  modalOptions ); //Return a bsModal (see below) with the tabs as content
    .bsSelectTab( indexOrId ); //Select the tab with index (integer) or id (string) == indexOrId

<a name="modal"></a>
## Modal

    $myModal = $.bsModal( options ); 

### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `header` | `content` or `[] of content` | `""` | See above |
| `noHeader` | `boolean` | `false` | Prevent header even if `options.header` is set |
| `flex` | `boolean` | `false` | The default width of a modal is 300px. If `true` the width of the modal will adjust to the width of the browser up to 500px |
| `extraWidth` | `boolean` | `false` | Only when `flex` is set: If `true` the width of the modal will adjust to the width of the browser up to 800px |
| `scroll` | `string` or `boolean`  | `true` | `true` or `"vertical"`: Vertical scrollbar<br>`"horizontal"`: Horizontal scroll-bar<br>`false` or `""`: No scrollbar  |
| `type` | `string` | `""` | Sets `background-color` and `color` to match the [Noty](#noty) types<br> Possible value=`"alert"`, `"success"`, `"warning"`, `"error"`, `"info"`  |
| `noVerticalPadding` | `boolean` | `false` | If `true` the vertical padding around the contents is zero |
| `show` | `boolean` |  `true` | The modal is shown after creation |
| `static` | `boolean` |  `false` | If `true` the modal can only be closed on top-right (x) or a button|
| `fixedContent` |  |  | The contents of the fixed (no scroll-bar) part of the modal. Can be `DOM-element`, `jQuery-element`, `function( $container )` |
| `content` |  |  | The contents of the scrolling part of the modal. Can be `DOM-element`, `jQuery-element`, `function( $container )` |
| `contentContext` |  | `null` | The context for `content` (only `function`) |
| `footer` | `content` or `[] of content` | `""` | See above |
| `closeButton` | `boolean` | `true` | If `true` a close button is added. See `closeText` and `closeIcon` below |
| `buttons` | `[] of button-options` | `[]` | Array of options for buttons in the footer. See Button above. `closeOnClick: true/false` is added to set if the button closes the modal |
| `closeText` | `string or i18n-record`| `{da:'Luk', en:'Close'}` | The text for the close-button. |
| `closeIcon` | `string`| `"fa-times"` | The icon for the close-button |
| `extended` | `object`| `null` | The extended content. `{type, fixedContent, flex, noVerticalPadding, content, scroll, footer}`  |

### Methods

    .show(); //Show the modal


<a name="noty"></a>
## Noty

Using [Noty^3.1.3](https://ned.im/noty) to create noty-messages
**NOTE: In Noty>=3.0.0 the method `window.noty` in removed. Is added in this packages**

    $myNoty = $.bsNoty( options ); 

Each [modal](#modal) gets its own set of noty that are closed when the modal is closed

### options

Beside the normal [Noty options](https://ned.im/noty/#/options) the following new options and default are added

| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `text` or `content` | `content/jQuery-object` or `[] of content/jQuery-object` | `""` | See above |
| `textAlign` | `string` | `"left"` | `"left"`, `"center"`, or `"right"`  |
| `header` | `content` | `""` | See above  |
| `defaultHeader` | `boolean` | `false` | If `true` use default header (icon + text) defined in `$.bsNotyIcon` and `$.bsNotyName` |
| `onTop` | `boolean` | `false` | If `true` the noty is always on top of all other elements |
| `onTopLayerClassName` | `string` | `""` | Alternative class-name for the container containing the top notys |
| `flash` | `boolean` | `false` | If `true` the noty will flash for 3s when shown |
| `footer` | `content` or `[] of content` | `""` | See above |
| `buttons` | `[] of button-options` | `[]` | Array of options for buttons in the footer. See Button above. `closeOnClick: true/false (default:true)` is added to set if the button closes the modal |


Each modal gets its own set of noty

### Methods
    noty.flash(); //Flash the noty for 3s (again)

Five different methods are defined with default options depending of the type of noty:
- `queue`: `"global"` but if `!= "global"` `options.killer` is set to `options.queue`
- `killer`: if `options.queue != "global"` => `killer = queue` and the noty will close all noty with same queue.<br>To have unique queue and prevent closing: set `options.killer: false`<br>To close all noty set `options.killer: true`
- `timeout`: If `type="warning"` or `"success"` timeout is set to 3000ms. Can be avoided by setting `options.timeout: false`
- `defaultHeader`: If `type = "error": defaultHeader = true`
- `textAlert`: `"left"` if any header else `"center"`
- `closeWith`: if the noty has buttons then only button else only click

		//Simple centered noty with centered text	
		window.notySuccess( text [,options] ) / $.bsNotySuccess(...) / window.notyOk(...) / $.bsNotyOk(...)
    	
		//Simple error noty with header
		window.notyError(...) / $.bsNotyError(...)

    	//Simple warning noty with no header
		window.notyWarning(...) / $.bsNotyWarning(...)
    	
		//Simple alert noty with no header
		window.notyAlert(...) / $.bsNotyAlert(...)
    	
		//Simple info noty with no header
		window.notyInfo(...) / $.bsNotyInfo(...)
    
   
    	//window.noty: method to support noty^2 methods
    	window.noty( options );     
    
### **** NEW **** 
#### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `options1` | `boolean` | `true` | If `true` the ... |
| `options2` | `string` | `null` | Contain the ... |

### Methods

    .methods1( arg1, arg2,...): Do something
    .methods2( arg1, arg2,...): Do something else

<!-- 
<a name="input"></a>
## INPUT
### **** NEW **** 
#### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `options1` | `boolean` | `true` | If `true` the ... |
| `options2` | `string` | `null` | Contain the ... |

### Methods

    .methods1( arg1, arg2,...): Do something
    .methods2( arg1, arg2,...): Do something else
 -->


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/fcoo/jquery-bootstrap/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/fcoo)

## Contact information

NielsHolt nho@fcoo.dk


