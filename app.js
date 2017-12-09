var pg = require('pg');
var express = require('express');
var app = express();
var parser = require('body-parser');
var path = ('path');
var parseConnectionString = require('pg-connection-string');
var sharp = require('sharp');
var multer  = require('multer');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/public',express.static(__dirname + '/public'));

var connectionString;

if(process.env.DATABASE_URL){
  connectionString = process.env.DATABASE_URL
} else {
  connectionString = 'postgres://' + 
  process.env.POSTGRES_USER +':'+
  process.env.POSTGRES_PASSWORD+'@localhost/blogsite';
}

const pool = new pg.Pool(typeof connectionString === 'string' ? parseConnectionString.parse(connectionString) : connectionString);

app.set('view engine', 'ejs');

var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/img');
    },
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
});

var upload = multer({storage: storage});

app.get('/', function(req, res) {
    res.render('portfolio', {title:'portfolio'});
  });



app.get('/blog', function(req, res) {
  pool.connect(function(err, client, done) {
  	if (err) {
     console.log(`error: connection to database failed. connection string: ${connectionString} ${err}`);
    if (client) {done(client);}
     return;
   }
    client.query('select * from blogs ORDER BY ID DESC', function(err, result) {
    // for(var i = 0; i < result.rows.length; i++){
    //   result.rows[i].time = Date.parse(result.rows[i].time.toString()).toString('dddd MMM yyyy h:mm:ss');
    // }
    res.render('index', {result: result.rows, title: 'Blog'});
      done();
      });
  });
 }); 

app.post('/add', upload.single('newFile'), function (req, res, next) {
     sharp(req.file.path)
      .resize(400, 400)
      .toFile(req.file.path.split('.')[0] +'-tn.'+req.file.path.split('.')[1], function (err) {
 pool.connect(function(err, client, done) {
   if(err){
 console.log(err);
 return;
   }
    client.query('insert into blogs (title,exerpt,body,img,time) values ($1, $2, $3, $4, now())',[req.body.title,req.body.exerpt,req.body.body,req.file.path]);
   done();
   res.redirect('/blog');
  });
});
 });
// app.post('/add', function(req,res){

//   pool.connect(function(err, client, done) {
//   	if(err){
// 	console.log(err);
// 	return;
//   	}
//     client.query('insert into blogs (title,exerpt,body,time) values ($1, $2, $3, now())',[req.body.title,req.body.exerpt,req.body.body]);
// 		done();
// 		res.redirect('/blog');
//   });
// });



app.get('/post/*', function(req,res){
  pool.connect(function(err, client, done) {

   var path = req.path.split('/');
   var getId = path[path.length-1];
   client.query('select * from blogs where id=$1', [getId],function(err, blogpost) {
    res.render('blog', {blogpost: blogpost.rows, title: blogpost.rows[0].title});
      done();
      });
 });
});

app.post('/delete', function(req,res){
  pool.connect(function(err, client, done) {
    client.query('delete from blogs where id=$1',[Object.keys(req.body)[0]]);
      done();
      res.redirect('/blog');
      });
 });

app.get('*', function(req, res) {
    res.status(404).send('<h1>uh oh! page not found!</h1>');
});

var PORT = process.env.PORT || 3333;

//have the application listen on a specific port
app.listen(PORT, function () {
    console.log('Example app listening on port 3333!');
});