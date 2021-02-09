import pump = require('pump');
import { createReadStream, createWriteStream } from 'fs';
import * as Gulp from "gulp";
import { Transform } from 'stream';

const rs = createReadStream('/dev/random');
const ws = createWriteStream('/dev/null');

function toHex() {
    const reverse: Transform = new Transform();

    (reverse as any)._transform = (chunk: any, enc: any, callback: any) => {
        reverse.push(chunk.toString('hex'));
        callback();
    };

    return reverse;
}

let wsClosed = false;
let rsClosed = false;
let callbackCalled = false;

function check() {
    if (wsClosed && rsClosed && callbackCalled) console.log(`pump finished`);
}

ws.on('close', () => {
    wsClosed = true;
    check();
});

rs.on('close', () => {
    rsClosed = true;
    check();
});

pump(rs, toHex(), toHex(), toHex(), ws, () => {
    callbackCalled = true;
    check();
});

setTimeout(() => {
    rs.destroy();
}, 1000);

setTimeout(() => {
    throw new Error('timeout');
}, 5000);

// $ExpectType Stream
pump(createReadStream('/dev/random'), toHex(), createWriteStream('/dev/null'));

// $ExpectType Stream
pump([createReadStream('/dev/random'), toHex(), createWriteStream('/dev/null')]);

const copy: Gulp.TaskFunction = (cb) => {
    pump([
        Gulp.src('/dev/random'),
        Gulp.dest('/dev/null'),
    ], (err) => {
        if (err) {
            cb(err);
            return;
        }
        console.log('Copy done with err = ' + err);
    });
};
