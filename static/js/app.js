var App = Ember.Application.create();

App.TopicModel = Ember.Object.extend({
	search: ""
});

App.Router.map(function () {
	this.resource('topic', { path: '/topic/:search' });
});

App.Route = Ember.Route.extend({
	actions: {
		goToTopic: function (topic) {
			// TODO: Display some sort of spinner that denotes whether there 
			// were any articles found for the topic.
			var model = App.TopicModel.create({ search: topic });
			this.transitionTo("topic", model);
		}
	}
});

App.IndexRoute = App.Route.extend({});
App.TopicRoute = App.Route.extend({
	model: function (params) {
		// TODO: Actually fetch data from the server in this condition.
		var model = App.TopicModel.create({ search: params.search });
		return model;
	},

	serialize: function (model, params) {
		return { search: model.get("search") }
	} 
});

App.MapView = Ember.View.extend({
	classNames: ['map'],

	didInsertElement: function () {
		var element = this.$().get(0);
		var layer = new L.StamenTileLayer("toner-lite");
		var map = new L.Map(element);
		map.addLayer(layer);
		map.setView([0, 0], 2);
	}
});