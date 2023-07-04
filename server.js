const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2');
const path = require('path');
const cron = require('node-cron');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);
const { error } = require('console');
const port = 3000;
const bodyParser = require('body-parser');

// app.use(express.static("public"));
// app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// DBのコネクションを作成
const con_config  = mysql.createPool({
    connectionLimit : 5,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'pre_toilet'
});

// ルーティングの設定
// index
app.get('/', (req,res) => {
    res.render('./index');
})
// toilet
// DBを分けるべきだった
app.get('/toilet', (req, res) => {
    //検索された文字を(から先を消し、駅を足す
    const station_name = req.query.station_name.substring(0, req.query.station_name.indexOf("(")) + '駅';

    con_config.query('SELECT * FROM station WHERE station_name = ?',
    station_name,
    (error_1, results_1, fields_1) =>{
        if (error_1) throw error
        con_config.query('SELECT * FROM station_toilet WHERE station_toilet.station_id = ?',
        results_1[0]['station_id'],
        (error_2, results_2, fields_2) =>{
            if (error_2) throw error
            con_config.query('SELECT * FROM station_gate WHERE station_id = ?',
            results_1[0]['station_id'],
            (error_3, results_3, fields_3) =>{
                if (error_3) throw error
                res.render('./toilet', {station:results_1, flg: results_2, gate: results_3});
                // console.log(results_1);
                // console.log(results_2);
                // console.log(results_3);
            });
        });
    });
});


// Socket.io接続
io.on('connection', function (socket) {
    console.log('接続完了');
});

// GetDbData = () => {

// }
//3秒毎に実行
cron.schedule('*/1 * * * * *', () => {
    con_config.query('SELECT * FROM station_toilet WHERE station_toilet.station_id = ?',
    1,
    (error, results, fields) =>{
        if (error) throw error
        io.emit('roomStatus', {flg:results});
        io.emit('use_status', {flg:results});
    });
});

//ドアの開け閉めでDBの変更するAPI
app.post('/toilet_post', (req, res, next) => {
    console.log("log");
    console.log(req.body.flag);

    con_config.query('UPDATE station_toilet SET toilet_flg = ? WHERE toilet_id = 18',[req.body.flag], (error, results, fields) => {
        if (error) throw error
        // console.log(req.body.data[0]);
    });
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.status(201).json({
        status: 'success',
      })
});

//画像の表示
app.get('/img/:img', (req, res) => {
    const img = req.params.img;

    res.sendFile(`${__dirname}/public/img/${img}`);
    console.log(`/img/${img} へアクセスがありました`);
});

//CSSを反映
app.get('/css/style.css', (req, res) => {
    res.sendFile(`${__dirname}/public/css/style.css`);
});

app.get('/js/search.js', (req, res) => {
    res.sendFile(`${__dirname}/public/js/search.js`);
});

http.listen(port, ()=> console.log("サーバーを起動しました。"));