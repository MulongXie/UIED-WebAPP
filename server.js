var child_process = require('child_process');
var express	= require("express");
var app	= express();

var uploadPath = 'data/inputs';
var index = 0;

var multer	=	require('multer');
var storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
        callback(null, index.toString() + '.jpg');
    }
});
var upload = multer({ storage : storage}).single('image');


app.use(express.static("public"));
app.use(express.static("data/inputs"));
app.use(express.static("data/outputs"));
app.use(express.static("processing"));
app.use(express.static("."));


app.get('/',function(req,res){
    res.sendfile("public/index.html");
});

app.get('/dashboard',function(req,res){
    res.sendfile("public/dashboard.html");
});

app.post('/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
            res.json({code: 0});
        }else {
            res.json({code:1,  imgPath:uploadPath + '/' + index.toString() + '.jpg'});
            index += 1;
        }
    });
});

app.get('/process', function (req, res) {
    let img_path = req.query.image_path;
    let output_path = 'data/outputs/' + img_path.split('/')[1] + img_path.split('/')[2];
    var workerProcess = child_process.exec('python3 xianyu.py ' + img_path + ' ' + output_path,
        function (error, stdout, stderr) {
        if (error) {
            console.log(stdout);
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
            res.json({code:0});
        }else{
            res.json({code:1, result_path:output_path});
            console.log('stdout: ' + stdout);
        }
    });

    workerProcess.on('exit', function () {
        console.log('Program Invoked');
    });
});

app.listen(8000,function(){
    console.log("Working on port 8000");
});
