define('pages.Index', function(page) {
	var th = this;
	var el = $$(page.container);
	var subjectId = 1;

	removeTemplate('tmlChapters');
	compileTemplates(['tmlChapters']);

	// load chapters
	$$.mb.controller.post({
		url: $$.mb.url('api/study/getChapters'),
		subjectId: subjectId
	}, {
		onSuccess: function(box) {
			box = $$.mb.cnv.fromJson(box);
			var chapters = Template7.templates.tmlChapters({chapters: box.chapters});
			el.find('.chapter-list').html(chapters);	
		}
	});

	// choose chapter
	el.on('click', '.chapter-item', function(e) {
		var id = $$(this).closest('.chapter-item').data('id')
		
		// load subchapters
		$$.mb.controller.post({
			url: $$.mb.url('api/study/getSubChapters'),
			chapterId: id
		}, {
			onSuccess: function(box) {
				box = $$.mb.cnv.fromJson(box);
				
				var ctx = $$.extend({}, $$(e.target).closest('.chapter-item').dataset());
				ctx.subChapters = box.subChapters;
				page.view.router.load({
			  		url: 'pages/chapter.html',
			  		context: ctx
			  	});      
			}
		});
	})
});