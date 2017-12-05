// global variables
var globals = {
	// container of classes
	class: {}
};

// defining class
function define(className, func) {
	globals.class[className] = func
}

// create instance of class
function createClass(className, params) {
	if (!globals.class[className]) {
		console.error('class "' + className + '" not found');
		return;
	}
	return new globals.class[className](params);
}

// compile template if it is not compiled already
function compileTemplate(template) {
	if (!Template7.templates[template]) {
		var tml = $$('script#' + template);
		if (tml.length == 0) {
			console.error('template "' + template + '" not found');
			return;
		}
		var html = tml.html().replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
		Template7.templates[template] = Template7.compile(html);
	}
}

function compileTemplates(templates) {
	templates.forEach(function(template) {
		compileTemplate(template)
	})
}

function removeTemplate(template) {
	delete Template7.templates[template];
}

// ##### Dom7 addons
(function(jQuery) {

	var class2type = {};

	jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});

	jQuery.extend(jQuery, {
		isFunction: function( obj ) {
			return jQuery.type(obj) === "function";
		},
		isArray: Array.isArray || function( obj ) {
			return jQuery.type(obj) === "array";
		},
		isNumeric: function( obj ) {
			return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
		},
		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
		type: function (obj) {
			if ( obj == null ) {
				return obj + "";
			}	
			return (typeof obj === "object" || typeof obj === "function") ?
				class2type[toString.call(obj)] || "object" : typeof obj;
		}
	});
})(Dom7);
