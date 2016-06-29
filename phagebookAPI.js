// Add script tag to html for Q Promise library hosted at cdnjs and JQuery library
//<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/q.js/0.9.6/q.min.js"></script>

//Encapsulate all code in this immediately-invoked function expression (aka: self-evoking anonymous function).
//Maintains scope and state for entirety of the library's execution.
(function(Phagebook) {

	//Callback function (for processing received messages) hash table --> Key: request id, Value: callback function
    // Callback are functions that respond to only sent/responded messages.
    var callbackHash = {}; 

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                              WebSocket                                                //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var socket = new WebSocket("wss://localhost:8443/websocket");
    socket.messageCache = []; // Queue of potential socket messages that were sent before the socket was opened.

    socket.onopen = function() {
        console.log("websocket opened!");
        ///Remember JS is single-threaded so the WebSocket will not reach readystate=1 until 
        ///the entire library finishes loading. In the off chance the user writes a script that calls
        ///a Phagebook function immediately upon completion of dependencies loading, the socket will not 
        ///have had enough time to enter readystate. Handle this by storing those calls (if any are made)
        ///and executing them in this socket.onopen() method.
        for (var i=0; i < socket.messageCache.length; i++){
            socket.send(socket.messageCache[i]);
        }
    };

    // Process the message received
    // The message is only received when the client sends message first. Thus, the messages received are the serverside response.
    socket.onmessage = function(evt) {
        // Parse message into JSON 
        var dataJSON = JSON.parse(evt.data);
        var channel = dataJSON.channel;
        var requestId = dataJSON.requestId;
        if (requestId !== null) {
            // If callback function exists, run it
            var callback = callbackHash[channel + requestId];
            if (callback !== undefined) {
                callback(dataJSON.data);
                delete callbackHash[channel + requestId];
            }
        }
    };

    // Sends data when socket is ready.
    // THIS IS WHERE MESSAGES ARE CACHED.
    socket.sendwhenready = function(message) {
        if (socket.readyState == 1) {
            socket.send(message);
        }
        else {
            console.log("caching " + message);
            socket.messageCache.push(message);
        }
    }

    // Converts the data to send into a JSON format. (Kind of)
    function Message(channel, data, requestID, options) {
        this.channel = channel;
        this.data = data;
        this.requestId = requestID;
        if (typeof options != undefined){
            this.options = options;
        }
    }

    // A generator would be nice
    var lastRequestId = -1;
    function nextId(){
        lastRequestId++;
        return lastRequestId; 
    } 

    // Helper function: Sends message to server 
    // Will be called multiple times, changing "lastRequestId".
    socket.emit = function(channel, data, options) {
        // Create 'deferred' object ... Q is a global variable
        var deferred = Q.defer();
        var requestID = nextId();
        // var message = '{"channel":"' + channel + '","data":"' + data + '","requestId":"' + requestID + '"}';
        var message = new Message(channel, data, requestID, options);
        var callback = function(dataFromServer) {
            deferred.resolve(dataFromServer);
        };
        // Hash callback function: (channel + requestID) because we need to distinguish between "say" messages and desired responses from server. 
        callbackHash[channel + requestID] = callback; /////////// Indexing the hashtable.
        socket.sendwhenready(JSON.stringify(message));
        return deferred.promise;
    };

    /**
     * Returns [spec, options]
     */
    var parseQueryArgs = function(schema, name, options) {
        if (typeof(schema) !== 'string') {
            return {obj:schema, options:name};
        }
        else {
            return {obj:{schema:name}, options:options};
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          Phagebook Object                                             //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    window.Phagebook = Phagebook.prototype = { //Phagebook function prototypes

        /**Phagebook Websocket Channels:
			CREATE_STATUS,
			CHANGE_ORDERING_STATUS,
			CREATE_PROJECT_STATUS,
			GET_PROJECTS,
			GET_ORDERS,
			GET_PROJECT,
			GET_ORDER
         */






         /**
         * Phagebook.createStatus
         * create the status of the user
         */
        createStatus: function (object, options) {
            return socket.emit("createStatus", object, options);
        }, 

        /**
         * Phagebook.updateOrderStatus
         * updates the status of the order
         */
        updateOrderStatus: function (object, options) {
            return socket.emit("updateOrderStatus", object, options);
        }, 

        /**
         * Phagebook.addToOrder
         * add the object to user's orders
         */
        addToOrder: function (object, options) {
            return socket.emit("addToOrder", object, options);
        }, 

        /**
         * Phagebook.createProject
         * create a project on Phagebook
         */
        createProject: function (object, options) {
            return socket.emit("createProject", object, options);
        }, 

        /**
         * Phagebook.addFriend
         * add a friend on Phagebook
         */
        addFriend: function (object, options) {
            return socket.emit("addFriend", object, options);
        }, 

        /**
         * Phagebook.addTeamMember
         * add a team member on Phagebook
         */
        addTeamMember: function (object, options) {
            return socket.emit("addTeamMember", object, options);
        }, 

        /**
         * Phagebook.sendResult
         * send the result of user's project to Phagebook
         */
        sendResult: function (object, options) {
            return socket.emit("sendResult", object, options);
        }, 

        /**
         * Phagebook.sendSample
         * send a sample of user's project to Phagebook
         */
        sendSample: function (object, options) {
            return socket.emit("sendSample", object, options);
        }, 

        /**
         * Phagebook.sendProtocol
         * send protocals to Phagebook
         */
        sendProtocol: function (object, options) {
            return socket.emit("sendProtocol", object, options);
        }, 

        /**
         * Phagebook.addEntry
         * add new entry on Phagebook
         */
        addEntry: function (object, options) {
            return socket.emit("addEntry", object, options);
        }
        
    };
}(Phagebook = window.Phagebook || {}));