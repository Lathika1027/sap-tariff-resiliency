const subscribers = {};

function subscribe(eventType, callback) {
    if (!subscribers[eventType]) {
        subscribers[eventType] = [];
    }

    subscribers[eventType].push(callback);
}

function publish(event) {
    const eventType = event.eventType;

    console.log(`\n[EVENT BUS] Publishing: ${eventType}`);

    if (!subscribers[eventType]) {
        console.log(`[EVENT BUS] No subscribers for ${eventType}`);
        return;
    }

    subscribers[eventType].forEach(callback => {
        callback(event);
    });
}

module.exports = {
    subscribe,
    publish
};