var App = Ember.Application.create();

App.TopicModel = Ember.Object.extend({
	topic: ""
});

App.TopicModel.reopenClass({
	find: function (topic) {
		var model = App.TopicModel.create({ topic: topic });
		return model;
	}
});

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

App.TopicController = Ember.ObjectController.extend({
	sliderValue: 0
});

App.MapView = Ember.View.extend({
	layers: {},
	weights: {},

	_getFeatureKey: function (feature) {
		return feature.properties.name;
	},

	_getFeatureStyle: function (weight) {
		return {
			weight: 2,
			opacity: 1,
			color: "white",
			fillOpacity: 0.7,
			fillColor: "blue"
		};
	},

	stylize: function () {
		for (var k in this.layers) {
			if (!layers.hasOwnProperty(k))
				continue;

			var layer = this.layers[k];
			var weight = this.weights[k] || 0;
			layer.setStyle(this._getFeatureStyle(weight));
		}
	}.observes("weights"),

	didInsertElement: function () {
		var element = this.$().get(0);
		var options = { minZoom: 2, maxZoom: 4, zoomAnimation: false };
		var map = new L.Map(element, options);
		var tiles = new L.StamenTileLayer("toner-lite");

		map.setView([40, 0], 2);
		map.addLayer(tiles);

		Ember.$.getJSON('/static/data/world.json')
			.then(function(world) { 
				L.geoJson(world, {
					style: function (feature) {
						var weight = this.weights[this._getFeatureKey(feature)] || 0;
						return this._getFeatureStyle(weight);
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
	max: 5,
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
