
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	dateFormat = require('dateformat');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/receipts');

var Schema = mongoose.Schema;

var ReceiptSchema = new Schema({
	description	: String,
	amount		: Number,
	date		: Date
});

var Receipt = mongoose.model('Receipt', ReceiptSchema);

var app = module.exports = express.createServer(),
	io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
	Receipt.find({}, function (err, docs) {
		res.render('index', { title: 'Receipts Index' , receipts: docs,  dateFormat: dateFormat});
	});
});

app.get('/:id/delete', function(req, res) {
	var receipt = Receipt.findById(req.params.id);
	receipt.remove();
	res.send(200);
});

app.post('/new.:format?', function(req, res) {
	var newReceipt = new Receipt();
	newReceipt.description = req.body.description;
	newReceipt.amount = req.body.amount;
	newReceipt.date = req.body.date;
	newReceipt.save();
	res.send(newReceipt);
});

io.sockets.on('connection', function (socket) {
  socket.on('new', function (data) {
	socket.emit('new', data);
    socket.broadcast.emit('new', data);
  });
  socket.on('delete', function(data) {
	socket.emit('delete', data);
	socket.broadcast.emit('delete', data);
  });
});

app.listen(3000);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
