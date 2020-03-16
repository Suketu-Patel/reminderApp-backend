const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');


const chalk = require('chalk')

const subscriptionHandler = require('./subscriptionHandler')
console.log(subscriptionHandler.handlePushNotificationSubscription)

const app = express();

const PORT = process.env.PORT ||8000;

let cronTasks = [];

app.use(
    bodyParser.urlencoded({
        extended: true
    })
)

app.use(bodyParser.json())

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can paste a specific url instead of * to block other sites from accessing this api

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
})

app.get('/', (req, res) => {
    res.end('<h1>This is backend of reminderApp</h1>')
    console.log(req.url, "accessed by", chalk.red(req.headers.referer))

})
app.post('/', (req, res) => {
    console.log(req.hostname + ":" + PORT + req.url, "accessed by", chalk.red(req.headers.referer))
})

app.post("/subscription", subscriptionHandler.handlePushNotificationSubscription);
app.get("/subscription/:id", subscriptionHandler.sendPushNotification);


app.post('/setTimer', async (req, res) => {
    const timerVals = req.body.expirationDate.split(" ");
    const [minute, hour, date, month, day] = timerVals;
    const id = minute+hour+date+month+day+req.body.title;
    const sub_id = req.body.id;
    subscriptionHandler.sendPushNotification(req,res,sub_id)
    cronTasks.push({
        // This id will create a collision with similar date reminders
        id:id,
        schedule: await cron.schedule(`0 ${minute} ${hour} ${date} ${month} ${day}`, () => {
            
            subscriptionHandler.sendPushNotification(req,res,sub_id)
            
            console.log("⏰", chalk.cyan(req.body.title))
            const taskToDelete = cronTasks.find((task)=>{return task.id === id})
            taskToDelete.schedule.destroy()
            cronTasks = cronTasks.filter((task)=>task.id!==id);
        }
        )
    });
    res.end();
})

app.get('/getCronTasks', (req, res) => {
    console.log(cronTasks);
    res.end();
})

app.post('/destroyTask', (req, res) => {
    const timerVals = req.body.expirationDate.split(" ");
    const [minute, hour, date, month, day] = timerVals;
    const id = minute+hour+date+month+day+req.body.title;
    const taskToDelete = cronTasks.find((task)=>{return task.id === id})
    taskToDelete.schedule.destroy()
    cronTasks = cronTasks.filter((task)=>task.id!==id);
    res.end();
})

app.listen(PORT, () => {
    console.clear();
    console.log(chalk.blue("Server is running"));
    console.log("Go to: ", chalk.yellow("http://localhost:8000"))
})