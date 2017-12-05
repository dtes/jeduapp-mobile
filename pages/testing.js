define('pages.Testing', function(page) {
	var th = this;
	var el = $$(page.container);
	var ctx = page.context;
	var box = ctx.box;

	compileTemplates(['tmlQuestion']);

	var questionNumber = 0;
	var questionContainer = el.find('.question-wrapper');
	var questionCounter = el.find('.question-counter');
	var variantsByQuestion = groupVariants();
	var answers = {};
	var forceBack = false;

	// render question
	if (box.questions.size() > 0) {
		// render first question
		renderQuestion(box.questions.getAt(0));

		// navigation between questions
		var btnPrev = el.find('.btn-nav-question.prev');
		var btnNext = el.find('.btn-nav-question.next');
		el.find('.btn-nav-question').click(function(e) {
			var target = $$(e.target);
			questionNumber = target.hasClass('prev') ? --questionNumber : ++questionNumber;

			if (questionNumber == 0) {
				btnPrev.addClass('hidden');
			} else {
				btnPrev.removeClass('hidden');
			}

			if (questionNumber == box.questions.size() - 1) {
				btnNext.addClass('hidden');
			} else {
				btnNext.removeClass('hidden');
			}

			renderQuestion(box.questions.getAt(questionNumber));
		})
	}

	// select variant
	el.on('click', '.question-variant', function(e) {
		var variant = $$(e.target);
		var variants = el.find('.question-variant');
		var question = variant.closest('.question');

		variants.removeClass('selected');
		variant.addClass('selected');

		answers[question.data('id')] = variant.data('id');
		// console.log(question.data('id'), variant.data('id'));

		if (isDone()) {
			el.find('.btn-finish').removeClass('hidden')
		}
	});

	// finish test
	el.on('click', '.btn-finish', function() {
		var store = $$.mb.model.createStore('Answer');

		for (var question in answers) {
			store.add({
				questionId: question,
				variantId: answers[question]
			});
		}

		$$.mb.controller.post({
			url: $$.mb.url('api/study/finishTest'),
			answers: store,
			subChapter: ctx.subchapterid
		}, {
			onSuccess: function() {
				forceBack = true;
				page.view.router.back();
			},
			onError: function() {
				console.log(arguments);
			}
		})
	});

	// functions
	// render question
	function renderQuestion(question) {
		var obj = $$.extend(question.data, {
			variants: variantsByQuestion[question.data.id]
		});
		questionContainer.html(Template7.templates.tmlQuestion(obj));
		questionCounter.html((questionNumber + 1) +'/' + box.questions.size());

		// autoselect variant
		if (answers[question.data.id]) {
			var selector = $$.mb.string.f('.question-variant[data-id="{0}"]', answers[question.data.id]);
			questionContainer.find(selector).addClass('selected');
		}
	}

	// group variants by question
	function groupVariants() {
		var obj = {};

		box.variants.each(function(variant) {
			if (!obj[variant.data.questionId]) {
				obj[variant.data.questionId] = [];
			}
			obj[variant.data.questionId].push(variant.data);
		});

		return obj;
	}

	// user answered for all questions
	function isDone() {
		return Object.keys(answers).length == box.questions.size()
	}

	th.preventBack = function() {
		if (forceBack) {
			return true;
		}

		// if (!isDone()) {
		if (true) {
			app.confirm('Вы уверены что хотите завершить?', 'Предупреждение', function() {
				forceBack = true;
				page.view.router.back();
			});

			return false;
		}
	}
})