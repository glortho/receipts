var receiptApp = {
	sockets: function() {
		var that = this,
			socket = io.connect('http://localhost');

		socket.on('new', function(data) {
			that.write_one(data);
		});

		socket.on('delete', function(id) {
			$('#p' + id).remove();
		});
	},

	write_one: function(data) {
		$('<p/>', {id: 'p' + data._id})
			.appendTo('#list')
			.html(dateFormat(data.date, 'mm/dd/yyyy') + ', ' + data.description + ', ' + data.amount)
			.append("<a href='/" + data._id + "/delete' id='" + data._id + "' class='delete'>Delete</a>");
	},

	init: function() {
		this.sockets();
	}
};

$(function() {
	$('#list').on('click', '.delete', function() {
		var id = this.id;
		$.ajax({
			url: '/' + id + '/delete',
			type: 'get'
		})
		.done(function() {
			socket.emit('delete', id);
		});
		return false;
	});

	$('#form').submit(function() {
		$.ajax({
			url: '/new.json',
			type: 'post',
			dataType: 'json',
			data: $(this).serialize()
		})
		.done(function(data) {
			socket.emit('new', data);
		});
		return false;
	});
});
