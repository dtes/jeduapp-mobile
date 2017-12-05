// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// set base url
$$.baseUrl = 'http://localhost:8080/wax/app/';

// App instance
var app = new Framework7({
	template7Pages: true,
	precompileTemplates: true,
	init: false,
	debug: true,
	
	// If it is webapp, we can enable hash navigation:
	pushState: true,

    // Hide and show indicator during ajax requests
    onAjaxStart: function (xhr) {
    	app.showIndicator();
    },
    onAjaxComplete: function (xhr) {
    	app.hideIndicator();
    },

    preroute: function (view, options) {
    	var activePage = view.activePage;
    	var fromPage = activePage.fromPage;

    	if (options.isBack) {
			if (activePage && activePage.container) {
				var instance = $$(activePage.container).data('instance');

    			// preventing back to prev page
				if (instance && instance.preventBack) {
					return instance.preventBack();
				}
			}
    	}
	}
});

// creating class instances for pages
$$(document).on('page:init', function (e) {
	var page = e.detail.page;
	var el = $$(page.container);
	var dataset = $$(page.container).dataset();

	// page jsclass
	if (dataset.jsclass) {
		var instance = createClass(dataset.jsclass, page);
		$$(page.container).data('instance', instance);
		
		// page event listeners
		if (instance.onReinit) {
			el.on('page:reinit', function(e) { return instance.onReinit(e); })
		}
		if (instance.onBeforeAnimation) {
			el.on('page:beforeanimation', function(e) { return instance.onBeforeAnimation(e); })
		}
		if (instance.onAfterAnimation) {
			el.on('page:afteranimation', function(e) { return instance.onAfterAnimation(e); })
		}
		if (instance.onBeforeRemove) {
			el.on('page:beforeremove', function(e) { return instance.onBeforeRemove(e); })
		}
		if (instance.onBack) {
			el.on('page:back', function(e) { return instance.onBack(e); })
		}
		if (instance.onAfterBack) {
			el.on('page:afterback', function(e) { return instance.onAfterBack(e); })
		}
	}
});

// Add views
var mainView = app.addView('#tab1', {
	dynamicNavbar: true,
	precompileTemplates: true
});
var statisticView = app.addView('#tab2', {
	dynamicNavbar: true,
	precompileTemplates: true
});
var battleView = app.addView('#tab3', {
	dynamicNavbar: true,
	precompileTemplates: true
});

// init app
app.init();