# fcoo-bootstrap
>
[jquery-value-format]:https://github.com/FCOO/jquery-value-format
[i18next-phrases]:https://github.com/FCOO/i18next-phrases

## Description
This plugin contains jQuery methods to create different types of elements e.q. buttons, list, select, tables, modal windows etc. displayed in a adjusted version of Bootstrap 4 default theme

## Installation
### bower
`bower install https://github.com/FCOO/fcoo-bootstrap.git --save`

## Demo
http://FCOO.github.io/fcoo-bootstrap/demo/ 

## Usage

### Common
There are some common options used for (almost) all types of elements

#### `text` and `icon`
    
`text` can be a 
- String - `{ text: "This is just a test" }`
- i18n `namespace:key` - `{ text: "myNamespace:myKey" }`
- [i18next-phrases]-object - `{lang1:"...", lang2:"...",...langN:"..."}`

`icon` are standard Fontawesome class-name     

    { text: "With icon", icon:" fa-home" }
    { text: {da:"På dansk", en:"In English"}, icon:" fa-home" }

#### `link` and `onClick`
`link` can be a url (string) or a function
`onClick` is always a function 

#### `textStyle`
Is a `string` or `object` with info on text-style for the element
Possible values: `left right center lowercase uppercase capitalize normal bold italic`

    { textStyle: "left capitalize" } //As string
    { textStyle: { left: true, capitalize: true} } //As object

#### array of content
The content of e.q. buttons, tables, accordions, header or footer can be a array of object with `icon, text, textStyle, link` and will be added with space between

	header: [
		{ icon: "fa-home", text:{da: "Dansk", en:"English" },
		{ text: {da: "Link til noget", en:"Link to something"}, link:"http://mypage.com", textStyle:"italic" }
	]

#### Element is selected
Use any of the following options
 `options.selected, options.checked, or options.active`

#### `allowZeroSelected [Boolean] default = false`
If true it is allowed to unselect a selected child-element

#### List/array of child-elements
Use any of the following options
 `options.list, options.buttons, options.items, or options.children`


### Table

    var myTable = $.bsTable( options );


#### Format of content
The content of the table's cell can be set and updated using [jquery-value-format].
No formats are defined in this package (See examples at [fcoo-value-format](https://github.com/FCOO/fcoo-value-format))
The column-options `vfFormat` and `vfOptions` defines witch format the content of the cells are used to display the data. If `vfFormat == ""` the content is simple string or *array of content* (see above)


#### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `simpleTable` | `boolean` | `true` | If `false` the table is created with fixed headers and scrollbar in contents/tbody |
| `showHeader` | `boolean` | `true` | Hide/Show the columns headers |
| `verticalBorder` | `boolean` | `true` | Show/hide header row |
| `selectable` | `boolean` | `false` | Allow row to be selected |
| `selectedId` | `string` | `""` | id for selected row |
| `onChange` | `function(id, selected, trElement)` | `null` | Called when a row is selected or unselected (if `options.allowZeroSelected == true`) |
| `allowZeroSelected` | `boolean` | `false` | If true it is allowed to unselect a selected row |
| `columns` | `[] of columnOptions` | `[]` | |

#### columnOptions
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| `id` | `string` | auto created |  |
| `header` | `string`, `object` or `[] of object` | `""` | `{icon,text,title,link}` - See above |
| `align` | `string` | `"left"` | `"left", "center", or "right"`. Text alignment for the column |
| `sortable` | `boolean` | `false` | If `true` the column can be sorted. **NOT IMPLEMENTED** |
| `vfFormat` | `string` | `""` | See above |
| `vfOptions` | `object` | null | See above |


### **** NEW ****
#### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| options1 | boolean | true | If <code>true</code> the ... |
| options2 | string | null | Contain the ... |

### Methods

    .methods1( arg1, arg2,...): Do something
    .methods2( arg1, arg2,...): Do something else



## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/fcoo-bootstrap/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/FCOO)

## Contact information

NielsHolt nho@fcoo.dk


## Credits and acknowledgments
