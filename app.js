var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var db=require('./config/connection');
var session = require('express-session');
var hbs = require('express-handlebars');


var app = express();

//index increment
let Handlebars = require('handlebars');
Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value)+1;
});

//to check the order status

Handlebars.registerHelper('ifCheck', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
})

// RETRUN A PRODUCT
Handlebars.registerHelper('ifReturn',function(arg1,options){
  let returnDate =new Date()-0
  let expireDate = arg1-(10*24*60*60*600)
  return (returnDate>expireDate) ? options.fn(this):options.inverse(this);

})

//xxxxxxxxxxxxxxxxxxx view engine setup xxxxxxxxxxxxxxxxxxxxx
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx session xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
app.use(session({ secret: "Key", cookie: { maxAge: 600000 } }));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private,no-store,must-revalidate,max-stale=0,pre-check=0')
  next()
})

app.engine('hbs',hbs.engine({ extname: 'hbs',defaultLayout:'layout',layoutsDir: __dirname + '/views/layout/',partialsDir: __dirname + '/views/partials/'}))
db.connect((err)=>{
  if (err) {
    console.log("Database not connected" + err);
  } else {
    console.log("Database Connected to port 27017");
  }
 
})
app.use('/', usersRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{not:true});
});

module.exports = app;
