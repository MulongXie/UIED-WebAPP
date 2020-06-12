const fs = require('fs');
let path = require('path');

const filePath = path.join(__dirname,'test.txt');
console.log(`正在监听 ${filePath}`);
let watcher = fs.watch(filePath, () => {
    if (filePath) {
        console.log(`${filePath}文件发生更新`);
        watcher.close();
    }
});