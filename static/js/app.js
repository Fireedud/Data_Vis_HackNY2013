var App = Ember.Application.create();

App.Router.map(function () {
	this.resource('topic', { path: '/topic/:topic' });
});

App.Route = Ember.Route.extend({
	actions: {
		goToTopic: function (topic) {
			var model = App.TopicModel.find(topic);
			this.transitionTo("topic", model);
		}
	}
});

App.IndexRoute = App.Route.extend({});

App.TopicRoute = App.Route.extend({
	model: function (params) {
		return App.TopicModel.find(params.topic);
	},

	serialize: function (model, params) {
		return { topic: model.get("topic") }
	} 
});

App.TopicModel = Ember.Object.extend({
	topic: "",
	articles: [],
	loading: 0
});

App.TopicModel.reopenClass({
	find: function (topic) {
		var model = App.TopicModel.create({ topic: topic });
		var load = function (uri, callback) {
			model.set("loading", model.get("loading") + 1);
			Ember.$.getJSON(uri).then(function (data) {
				model.set("loading", model.get("loading") - 1);
				callback(data);
			}.bind(this));
		}.bind(this);

		load('/articles/nytimes/' + encodeURIComponent(encodeURIComponent(topic)), function (articles) {
			var as = articles.map(function (article) {
				var a = Ember.Object.create(article);
				var uri = '/article/' + encodeURIComponent(encodeURIComponent(article.web_url));
				a.set("clicks", {});
				load(uri, function (rsp) { 
					a.set("clicks", rsp.clicks); });
				return a;
			});
			model.set("articles", as);
		});

		return model;
	}
});

App.TopicController = Ember.ObjectController.extend({
	sliderValue: 0,
	magnitudes: {},

	_getDateMagnitudes: function (date) {
		var max = 0;
		for (var country in date) {
			if (max < date[country]) max = date[country];
		}

		var magnitudes = {};
		for (var country in date) {
			magnitudes[country] = Math.log(date[country]) / Math.log(max);
		}
		return magnitudes;
	},

	isLoading: function () {
		return this.get("loading") > 0;
	}.property("loading"),

	clicks: function () {
		var articles = this.get("articles");
		var all = {};

		articles.forEach(function (article) {
			for (var time in article.clicks) {
				if (!all[time]) all[time] = {};
				for (var country in article.clicks[time]) {
					all[time][country] = (all[time][country] || 0) +
															 article.clicks[time][country];
				}
			}
		});

		return all;
	}.property("articles", "articles.@each.clicks"),

	updateMapColoring: function () {
		var clicks = this.get("clicks");
		var date = Ember.keys(clicks)[this.get("sliderValue")];
		this.set("magnitudes", this._getDateMagnitudes(clicks[date]));
	}.observes("articles", "articles.@each.clicks", "sliderValue")
});

App.MapView = Ember.View.extend({
	layers: {},
	magnitudes: {},

	_getFeatureKey: function (feature) {
		return feature.properties.iso_a2;
	},

	_getFeatureStyle: function (magnitude) {
		return {
			weight: 1,
			opacity: 1,
			color: "silver",
			fillOpacity: magnitude || 0,
			fillColor: "blue"
		};
	},

	stylize: function () {
		for (var k in this.layers) {
			if (!this.layers.hasOwnProperty(k))
				continue;

			var layer = this.get("layers")[k];
			var magnitude = this.get("magnitudes")[k];
			layer.setStyle(this._getFeatureStyle(magnitude));
		}
	}.observes("magnitudes"),

	didInsertElement: function () {
		var element = this.$().get(0);
		var options = { minZoom: 2, maxZoom: 4, zoomAnimation: false, zoomControl: false };
		var map = new L.Map(element, options);
		var tiles = new L.StamenTileLayer("toner-lite");

		map.setView([40, -40], 2);
		map.addLayer(tiles);

		Ember.$.getJSON('/static/data/world.json')
			.then(function(world) { 
				L.geoJson(world, {
					style: function (feature) {
						var magnitude = (this.magnitudes || {})[this._getFeatureKey(feature)];
						return this._getFeatureStyle(magnitude);
					}.bind(this),

					onEachFeature: function (feature, layer) {
						this.layers[this._getFeatureKey(feature)] = layer;
					}.bind(this)
				}).addTo(map); 
			}.bind(this));
	}
});

App.SliderView = Ember.View.extend({
	value: 0,
	min: 0,
	max: 6,
	step: 1,

	didInsertElement: function () {
		this.$().slider({
			value: this.get("value"),
			min: this.get("min"),
			max: this.get("max"),
			step: this.get("step"),
			slide: function (event, ui) {
				this.set("value", ui.value);
			}.bind(this)
		});
	}
});
