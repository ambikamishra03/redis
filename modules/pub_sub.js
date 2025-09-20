// Publish/Subscribe (Pub/Sub) is a messaging pattern 
// Publishers send (publish) messages without knowing who will receive them.
// Subscribers receive messages they’re interested in, without knowing who sent them.
// A Broker/Channel sits in the middle, handling message delivery.


// create a class pubsub
class PubSub {
    constructor(){
        this.subscribers = {}; 
    }

 // publisher - priting press
 // newspaper publishing - event
 // customer - subscriber 
 
    //  subscribe to an event
    subscrribe(event,callback){
      if(!this.subscribers[event]){
        this.subscribers[event]=[] // add new if not existing
      }
      this.subscribers[event].push(callback);
    }

    // unsubscribe from an event
    unsubscribe(event,callback){
        if(!this.subscribers[event]) return;
        this.subscribers[event] = this.subscribers[event].filter(cb => cb!== callback)

    }


    // publish an event
    publish(event,data){
    if(!this.subscribers[event]) return;
    this.subscribers[event].forEach(callback => callback(data));
    }
}



// example usage

const chat = new PubSub();

// subscriber 1
chat.subscrribe("news",(data) =>{
  console.log("Subscriber 1 received: ",data);
})
// subscriber 2
chat.subscrribe("news",(data) =>{
  console.log("Subscriber 2 received: ",data);
})

// subscriber 3
chat.subscrribe("ack",(data) =>{
  console.log("Subscriber 2 received: ",data);
})

// publisher  send message to chatroom
chat.publish("news","Pub/Sub successfully implemented");
chat.publish("ack","Pub/Sub messages are sending");



// {
//   news: [callback1, callback2],
//   ack: [callback3]
// }
