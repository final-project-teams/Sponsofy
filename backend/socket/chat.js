module.exports.chatSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected to chat namespace");

    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
      console.log(`User sent message: ${data.message}`);
      io.to(data.room).emit("receive_message", {
        message: data.message,
        sender: data.sender,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from chat namespace");
    });
  });
};