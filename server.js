const port = 12000;

import path from 'path'
import express from 'express'
import sass from 'node-sass-middleware'
import eWs from 'express-ws'
import watch from 'node-watch'
import fs from 'fs'


const __dirname = path.resolve(path.dirname(''))

const app = express()

const expressWs = eWs(app)

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('static'))
app.use(
    sass({
        src: __dirname + '/sass',
        dest: __dirname + '/static'
    })
)

app.post('/teste',(req,res)=> {
    console.log("query",req.query)
    console.log("params",req.params)
    console.log("body",req.body)
    res.status(200)
    res.send('OK')
})


const aWss = expressWs.getWss('/ws-refresh')
app.ws('/ws-refresh', (ws,req) => {
    ws.on('message', (data) => {
        if(data !== 'ws-refresh: opened connection') {
            aWss.clients.forEach(function (client) {
                client.close()
            });
        } else {
            aWss.clients.forEach(function (client) {
                client.send('connected');
            });
        }
        
    })
    
})
const removeAllFiles = (path,callback) => {
    const throwError = () => {
        callback(false)
        console.log(err);
    }
    fs.readdir(path, (err, files) => {
        if (err) return throwError();
        
        for (const file of files) {
            fs.unlink(path+"/"+file, err => {
            if (err) return throwError();
            });
        }
        callback(true)
    })
}
watch('./sass/css', {recursive: true}, (e,name) => {
    try {
        removeAllFiles('static/css/', (ok) => {
            if(ok) aWss.clients.forEach(client => {
                client.send('{"event":"refresh","type":"page"}')
            })
        })
        
    } catch(e) {
        console.log(e)
    }
})

watch('./static', {recursive: true}, (e,name) => {
    try {
        aWss.clients.forEach(client => {
            client.send('{"event":"refresh","type":"page"}')
        })
    } catch(e) {
        console.log(e)
    }
})


app.listen(port,() => {
    console.log('listening on ', port)
})