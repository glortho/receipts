var receiptApp = (function($) {
	this.init = function() {
		this.socket = this.sockets();
		this.bind_dom();
	};

	this.bind_dom = function() {
		var that = this;

		$(function() {
			that.collection.show();

			$('#form').on('submit', function() {
				that.save(this);
				return false;
			});

			$('#list').on('click', '.delete', function() {
				that.destroy(this);
				return false;
			});

		});
	};

	this.collection = {		
		show: function() {
			var that = this;

			$.ajax({
				url: '/list.json',
				type: 'get',
				dataType: 'json'
			})
			.done(function(data) {
				for (var i = data.length - 1; i >= 0; i--) {
					that.write_one(data[i]);
				}
			});
		},

		write_one: function(data) {
			$('<p/>', {id: 'p' + data._id})
				.appendTo('#list')
				.html(dateFormat(data.date, 'mm/dd/yyyy') + ', ' + data.description + ', ' + data.amount)
				.append("<a href='/" + data._id + "/delete' id='" + data._id + "' class='delete'>Delete</a>");
		}
	};

	this.destroy = function(el) {
		var that = this,
			id = el.id;

		$.ajax({
			url: '/' + id + '/delete',
			type: 'get'
		})
		.done(function() {
			that.socket.emit('delete', id);
		});
	};

	this.save = function(form) {
		var that = this;

		$.ajax({
			url: form.action,
			type: 'post',
			dataType: 'json',
			data: $(form).serialize()
		})
		.done(function(data) {
			that.socket.emit('new', data);
		});
	};

	this.sockets = function() {
		var that = this,
			socket = io.connect('http://localhost');

		socket.on('new', function(data) {
			that.collection.write_one(data);
		});

		socket.on('delete', function(id) {
			$('#p' + id).remove();
		});

		return socket;
	};

	this.init();
})(jQuery);
