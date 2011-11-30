var Receipts = new Backbone.Collection();
Receipts.url = '/list.json';

var Receipt = Backbone.Model.extend({
	Collection: Receipts,

	url: function() {
		return '/' + this.get('_id') + '.json';
	}
});
