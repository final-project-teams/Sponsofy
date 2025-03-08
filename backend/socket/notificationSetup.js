module.exports.setupNotifications = (io) => {
  const notificationIo = io.of("/notification");
  notificationIo.on("connection", (socket) => {
    console.log("User connected to notification namespace");

    socket.on("subscribe_notifications", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} subscribed to notifications`);
    });

    socket.on("send_notification", (data) => {
      notificationIo.to(data.userId).emit("new_notification", {
        message: data.message,
        type: data.type,
        link: data.link,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from notification namespace");
    });
  });
};
