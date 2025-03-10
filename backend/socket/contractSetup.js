module.exports.setupContract= (io) => {
  io.on("connection", (socket) => {
    console.log("User connected to notification namespace");

    socket.on("subscribe_notifications", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} subscribed to notifications`);
    });

    socket.on("send_notification", (data) => {
      io.to(data.userId).emit("new_notification", {
        message: data.message,
        type: data.type,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from notification namespace");
    });
  });
};