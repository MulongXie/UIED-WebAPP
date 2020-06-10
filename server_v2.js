var child_process = require('child_process');
var express	= require("express");
var app	= express();

var output_root = '';
var input_img_path = '';
var index = 0;

// For base64 upload and save
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static("public"));
app.use(express.static("data/inputs"));
app.use(express.static("data/outputs"));
app.use(express.static("backend"));
app.use(express.static("."));


app.get('/',function(req,res){
    res.sendfile("public/index_v2.html");
});

app.post('/process_v2', function (req, res) {
    var id = index;
    index ++;
    var method = req.body.method;
    var input_type = req.body.input_type;

    var upload_path = 'data/inputs/' + id.toString() + '.jpg';
    var output_path = 'data/outputs/' + method + '/' + input_type + id.toString();

    // Convert the uploaded base64 image to jpg and process
    if (input_type == 'upload'){
        var img_base64 = req.body.upload_img.replace(/^data:image\/png;base64,/, "");
        fs.writeFile(upload_path, img_base64, 'base64', function (err) {
            if (err == null){
                element_detection(res, upload_path, output_path, method)
            }
            else {
                index --;
                console.log(err);
                res.json({code: 0})
            }
        });
    }
    else if (input_type == 'example'){
        console.log()
    }

});

app.get('/dashboard',function(req,res){
    // using ejs to set result path dynamically
    app.set('view engine', 'ejs');
    app.set('views', 'public');

    res.render('dashboard', {inputImgPath: input_img_path, outputRoot: output_root, method: method})
    // res.sendfile("public/dashboard.html");
});

app.listen(8000,function(){
    console.log("Working on port 8000");
});


function element_detection(res, input_path, output_path, method) {
    console.log('Running ' + method.toUpperCase() + ' on ' + input_path);
    var workerProcess = child_process.exec('python backend/' + method + '.py ' + input_path + ' ' + output_path,
        function (error, stdout, stderr) {
            if (error) {
                console.log(stdout);
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
                res.json({code:0});
            }else{
                console.log('stdout: ' + stdout + '\n');
                res.json({code:1, result_path:output_path});
            }
        });

    workerProcess.on('exit', function () {
        console.log('Program Invoked');
    });
}