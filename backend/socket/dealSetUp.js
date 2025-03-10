module.exports.setupDealSocket = (io) => {
  const dealIo = io.of("/deal");
  
  dealIo.on("connection", (socket) => {
    console.log("User connected to deal namespace");

    // Join a room specific to the user (company or content creator)
    socket.on("join_deal_room", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined deal room`);
    });

    // When a content creator sends a deal request
    socket.on("send_deal_request", (data) => {
      console.log("Deal request received:", data);
      // Emit to the company
      dealIo.to(data.companyUserId).emit("new_deal_request", {
        dealId: data.dealId,
        contractId: data.contractId,
        contentCreatorId: data.contentCreatorId,
        contentCreatorName: data.contentCreatorName,
        message: `${data.contentCreatorName} has requested a deal for your contract "${data.contractTitle}"`,
        timestamp: new Date()
      });
    });

    // When a company accepts a deal
    socket.on("accept_deal", (data) => {
      console.log("Deal acceptance received:", data);
      // Emit to the content creator
      dealIo.to(data.contentCreatorUserId).emit("deal_accepted", {
        dealId: data.dealId,
        contractId: data.contractId,
        companyName: data.companyName,
        message: `${data.companyName} has accepted your deal request for contract "${data.contractTitle}"`,
        timestamp: new Date()
      });
    });

    // When a company rejects a deal
    socket.on("reject_deal", (data) => {
      console.log("Deal rejection received:", data);
      // Emit to the content creator
      dealIo.to(data.contentCreatorUserId).emit("deal_rejected", {
        dealId: data.dealId,
        contractId: data.contractId,
        companyName: data.companyName,
        message: `${data.companyName} has rejected your deal request for contract "${data.contractTitle}"`,
        timestamp: new Date()
      });
    });

    // When a user disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected from deal namespace");
    });
  });
};
