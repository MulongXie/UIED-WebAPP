var child_process = require('child_process');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var express	= require("express");
var app	= express();

// For base64 upload and save
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

var index = 0;
app.post('/process', function (req, res) {
    var method = req.body.method;
    var input_type = req.body.input_type;
    var uied_params = req.body.uied_params;

    // console.log('Type:', input_type);
    // For uploaded image (base64 format)
    if (input_type == 'base64'){
        var id = index;
        index ++;
        var output_path = 'data/outputs/' + method + '/' + input_type + '_' + id.toString();
        var img_base64 = req.body.input_img.replace(/^data:image\/png;base64,/, "");
        var upload_path = 'data/inputs/' + id.toString() + '.jpg';
        // Convert the uploaded base64 image to jpg and process
        fs.writeFile(upload_path, img_base64, 'base64', function (err) {
            if (err == null){
                console.log('Upload image to', upload_path);
                // processing
                element_detection(res, upload_path, output_path, method)
                // element_detection_watching(res, upload_path, output_path, method, uied_params)
            }
            else {
                index --;
                console.log(err);
                res.json({code: 0})
            }
        });
    }
    // For existing examples and secondary processing on dashboard (.jpg format)
    else if (input_type == 'image'){
        var input_path = req.body.input_img;
        var input_path_split = input_path.split('/');
        var name = input_path_split[input_path_split.length - 1].split('.')[0];
        var output_path = 'data/outputs/' + method + '/' + input_type + '_' + name;
        // Existing examples
        if (input_path_split[0] == 'http:'){
            input_path = 'public/images/screen/' + name + '.jpg';
        }
        element_detection(res, input_path, output_path, method)
        // element_detection_watching(res, input_path, output_path, method, uied_params)
    }
});

app.get('/dashboard',function(req,res){
    var input_image = req.query.input_img;
    var output_root = req.query.output_root;
    var method = req.query.method;
    console.log("Activate Dashboard on", input_image, output_root, method, '\n\n');
    // using ejs to set result path dynamically
    app.set('view engine', 'ejs');
    app.set('views', 'public');
    res.render('dashboard', {inputImgPath: input_image, outputRoot: output_root, method: method})
});

app.post('/export', function (req, res) {
    let input_img_path = req.body.input_img_path;
    let compound_json_path = req.body.result_json_path;
    let compos = req.body.compos;

    console.log(compound_json_path);
    fs.writeFile(compound_json_path, JSON.stringify(compos, null, '\t'), function (err) {
        if (! err){
            let processer = child_process.exec('python backend/compound_img.py ' + input_img_path + ' ' + compound_json_path,
                function (error, stdout, stderr) {
                    if (error){
                        console.log(stdout);
                        console.log(error.stack);
                        console.log('Error code: '+error.code);
                        console.log('Signal received: '+error.signal);
                        res.json({code:0});
                    }
                    else {
                        console.log('Synthesize compound img successfully');
                        console.log(stdout);
                        res.json({code:1, compound_img_base64:stdout})
                    }
                });

            processer.on('exit', function () {
                console.log('Program Completed');
            });
        }
    });


});

app.listen(8000,function(){
    console.log("Working on port 8000");
});


function element_detection(res, input_path, output_path, method) {
    console.log('Running ' + method.toUpperCase() + ' on ' + input_path + " Save to " + output_path);
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
                res.json({code:1, result_path:output_path, upload_path:input_path});
            }
        });

    workerProcess.on('exit', function () {
        console.log('Program Completed');
    });
}

function element_detection_watching(res, input_path, output_path, method, uied_param) {
    let path_file = 'backend/' + method + '/parameters/parameters.txt';     // Pass input image path and output root to backend
    let note_success_file = 'data/outputs/success.txt';     // Backend notifies the server while process is done
    let note_fail_file = 'data/outputs/failed.txt';     // Backend notifies the server while process is done

    // Absolute paths pass to backend
    let abs_input_path = __dirname + '/' + input_path;
    let abs_output_path = __dirname + '/' + output_path;
    let abs_note_sucs_file = __dirname + '/' + note_success_file;
    let abs_note_fail_file = __dirname + '/' + note_fail_file;

    let parameters = `\n${abs_input_path} ${abs_output_path} ${abs_note_sucs_file} ${abs_note_fail_file}`;
    if (method == 'uied') parameters += ' ' + JSON.stringify(uied_param);
    console.log('Watching Mode Running ' + method.toUpperCase() + ' on ' + input_path + " Save to " + output_path);
    fs.appendFile(path_file, parameters, function (err) {
        if(err){throw err;}
        let watcher_success = fs.watch(note_success_file, function () {
            console.log(`${abs_note_sucs_file} Changed and Processing Success \n`);
            res.json({code:1, result_path:output_path, upload_path:input_path});
            watcher_success.close();
            watcher_failed.close();
        });

        let watcher_failed = fs.watch(note_fail_file, function () {
            console.log(`${abs_note_fail_file} Changed and Processing Failed \n`);
            res.json({code:0});
            watcher_failed.close();
            watcher_success.close();
        })
    })
}