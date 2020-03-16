const subscriptions = {};
let crypto = require("crypto");
const webpush = require("web-push");

const vapidKeys = {
    publicKey: "BNyGxFoSmc4P1pItx1EX_Zei3l8Uzd-41rNHuXuRiy7KpmLqO1Nxptykwi4XKqV3ccLHuuSWMKOsAtNuAH8gqko",
    privateKey: "hyZGZiE9exslJxwPSekgpZs24X6_NEHHXRmSiqCFoVs"
}

webpush.setVapidDetails("mailto:localhost:3000/",vapidKeys.publicKey, vapidKeys.privateKey)

const createHash = (input)=>{
    const md5sum = crypto.createHash("md5");
    md5sum.update(Buffer.from(input));
    return md5sum.digest("hex");
}

const handlePushNotificationSubscription = (req,res) =>{
    const subscriptionRequest = req.body;
    const subscriptionId = createHash(JSON.stringify(subscriptionRequest));
    subscriptions[subscriptionId] = subscriptionRequest;
    console.log(subscriptions[subscriptionId]);
    res.status(201).json({id:subscriptionId});
}

const sendPushNotification=(req,res,id,data) => {
    const subscriptionId = id;
    const pushSubscription = subscriptions[subscriptionId]
    const title = req.body.title;
    // const text = "sample text"
    console.log(subscriptions)
    webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: title||"Reminder!",
        text: text||"Sample reminder",
        image: "https://png2.cleanpng.com/sh/0d805b4c80129092c1bde780d50a75df/L0KzQYi4UsE4N5U5TZGAYUO5cYe4gcE6OJc6TpCAMEWzRIqCUME2OWQ6S6IEMEa0QIOATwBvbz==/5a36a61a190f56.5050499015135309061027.png",
        tag: "Reminder",
        url: "https://www.google.com"
      })
    )
    .catch(err => {
      console.log(err);
    });

  res.status(202).json({});
}

module.exports = { handlePushNotificationSubscription, sendPushNotification };