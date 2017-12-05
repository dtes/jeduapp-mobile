define('pages.Chapter', function(page) {
	var th = this;
	var el = $$(page.container);
	var selectedSubChapterId = 0;

	// page events
	th.onAfterAnimation = function() {
		if (selectedSubChapterId != 0) {
			$$.mb.controller.post({
				url: $$.mb.url('api/study/getSubChapter'),
				subChapterId: selectedSubChapterId
			}, {
				onSuccess: function(box) {
					box = $$.mb.cnv.fromJson(box);
					if (box.subChapter.data.train) {
						var result = box.subChapter.data.result;
						var selector = $$.mb.string.f('.subchapter[data-subchapterid="{0}"] .result', selectedSubChapterId)
						el.find(selector).html(result + '%').removeClass('hidden');
					}
				},
				onError: function() {
					console.error(arguments);
				}
			})
		}
	}

	// dom events
	el.find('.btn-open-subchapter').click(function(e) {
		var ctx = $$(e.target).closest('.subchapter').dataset();
		selectedSubChapterId = ctx.subchapterid;

		$$.mb.controller.post({
			url: $$.mb.url('api/study/getQuestions'),
			subChapterId: ctx.subchapterid
		}, {
			onSuccess: function(box) {
				box = $$.mb.cnv.fromJson(box);
				ctx.box = box.box;
				page.view.router.load({
					url: 'pages/testing.html',
					context: ctx
				});
			}
		});
	});
});