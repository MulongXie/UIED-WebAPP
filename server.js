var child_process = require('child_process');
var express	= require("express");
var app	= express();

var output_root = '';
var input_img_path = '';
var method = '';
var index = 0;

var uploadPath = 'data/inputs';
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
app.use(express.static("backend"));
app.use(express.static("."));


app.get('/',function(req,res){
    res.sendfile("public/index.html");
});

app.get('/dashboard',function(req,res){
    // using ejs to set result path dynamically
    app.set('view engine', 'ejs');
    app.set('views', 'public');

    res.render('dashboard', {inputImgPath: input_img_path, outputRoot: output_root, method: method})
    // res.sendfile("public/dashboard.html");
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

app.get('/uied', function (req, res) {
    // let input_img_path = 'data/example/2.jpg';
    method = 'uied';
    input_img_path = req.query.image_path;
    console.log('Running UIED on ' + input_img_path);
    let name = input_img_path.split('/')[1] + input_img_path.split('/')[2].split('.')[0];
    output_root = 'data/outputs/uied/' + name;

    var workerProcess = child_process.exec('python uied.py ' + input_img_path + ' ' + output_root,
        function (error, stdout, stderr) {
            if (error) {
                console.log(stdout);
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
                res.json({code:0});
            }else{
                console.log('stdout: ' + stdout + '\n');
                res.json({code:1, result_path:output_root});
            }
        });

    workerProcess.on('exit', function () {
        console.log('Program Invoked');
    });
});

app.get('/yolo', function (req, res) {
    // let input_img_path = 'data/example/2.jpg';
    method = 'yolo';
    input_img_path = req.query.image_path;
    console.log('Running YOLO on ' + input_img_path);
    let name = input_img_path.split('/')[1] + input_img_path.split('/')[2].split('.')[0];
    output_root = 'data/outputs/yolo/' + name;

    var workerProcess = child_process.exec('python yolo.py ' + input_img_path + ' ' + output_root,
        function (error, stdout, stderr) {
            if (error) {
                console.log(stdout);
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
                res.json({code:0});
            }else{
                console.log('stdout: ' + stdout + '\n');
                res.json({code:1, result_path:output_root});
            }
        });

    workerProcess.on('exit', function () {
        console.log('Program Invoked');
    });
});

app.listen(8000,function(){
    console.log("Working on port 8000");
});
