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

const sendPushNotification=(req,res,id) => {
    const subscriptionId = id;
    const pushSubscription = subscriptions[subscriptionId]
    console.log(subscriptions)
    webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: "Reminder!",
        text: "Sample reminder",
        image: "/images/trump.png",
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