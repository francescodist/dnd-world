const socket = io.connect({ transports: ["websocket"] });

socket.on("hello", (msg) => console.log(msg));