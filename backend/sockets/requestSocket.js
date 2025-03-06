export const setupRequestSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected to request namespace");

    socket.on("send_request", (data) => {
      io.emit("new_request", {
        from: data.from,
        to: data.to,
        type: data.type,
        timestamp: new Date(),
      });
    });

    socket.on("request_response", (data) => {
      io.emit("request_updated", {
        requestId: data.requestId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from request namespace");
    });
  });
};
