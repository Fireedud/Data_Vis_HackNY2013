var App = Ember.Application.create();

App.TopicModel = Ember.Object.extend({
	topic: ""
});

App.Router.map(function () {
	this.resource('topic', { path: '/topic/:topic' });
});

App.Route = Ember.Route.extend({
	actions: {
		goToTopic: function (topic) {
			// TODO: Display some sort of spinner that denotes whether there 
			// were any articles found for the topic.
			var model = App.TopicModel.create({ topic: topic });
			this.transitionTo("topic", model);
		}
	}
});

App.IndexRoute = App.Route.extend({});
App.TopicRoute = App.Route.extend({
	model: function (params) {
		// TODO: Actually fetch data from the server in this condition.
		var model = App.TopicModel.create({ topic: params.topic });
		return model;
	},

	serialize: function (model, params) {
		return { topic: model.get("topic") }
	} 
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
		var map = new L.Map(element);
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

});
