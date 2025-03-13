module.exports.setupDealSocket = (io) => {
  const dealIo = io.of("/deal");
  
  dealIo.on("connection", (socket) => {
    console.log("User connected to deal namespace");

    // Join a room specific to the user (company or content creator)
    socket.on("join_deal_room", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined deal room`);
    });

    // Handle leaving a room
    socket.on("leave_deal_room", (userId) => {
      socket.leave(userId);
      console.log(`User ${userId} left deal room`);
    });

    // When a content creator sends a deal request
    socket.on("send_deal_request", (data) => {
      console.log("Deal request received:", data);
      // Emit to the company
      dealIo.to(data.Contract.Company.user.id).emit("new_deal_request", data);
    });

    // When a company accepts a deal
    socket.on("accept_deal", (data) => {
      console.log("Deal acceptance received:", data);
      // Emit to the content creator
      dealIo.to(data.contentCreatorUserId).emit("deal_accepted",data);
    });

    // When a company rejects a deal
    socket.on("reject_deal", (data) => {
      console.log("Deal rejection received:", data);
      // Emit to the content creator
      dealIo.to(data.contentCreatorUserId).emit("deal_rejected", data);
    });

    // When a user disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected from deal namespace");
    });
  });
};
