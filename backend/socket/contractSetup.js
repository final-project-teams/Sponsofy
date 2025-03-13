// contractSocket.js
module.exports.setupContractSocket = (io) => {
  // Create a namespace for contract-related events
 
  io.on('connection', (socket) => {

    console.log('User connected to contract namespace');

    // Join a room for a specific contract
    socket.on('subscribe_contract', (contractId) => {
      socket.join(`contract:${contractId}`);
      console.log(`User subscribed to contract: ${contractId}`);
    });

    // Listen for term acceptance events
    socket.on('term_accepted', (data) => {
      // data should contain contractId, termId, role, and userId
      const { contractId, termId, role, userId } = data;
      
      // Broadcast to everyone in the contract room except the sender
      socket.to(`contract:${contractId}`).emit('term_status_changed', {
        termId: termId,
        acceptedBy: role,
        userId: userId,
        action: 'accepted',
        timestamp: new Date()
      });
      
      console.log(`Term ${termId} accepted by ${role} (User: ${userId})`);
    });

    // Listen for term update events
    socket.on('term_updated', (data) => {
      // data should contain contractId, termId, updates, and updatedBy
      const { contractId, termId, updates, updatedBy } = data;
      
      // Broadcast to everyone in the contract room
      contractIO.to(`contract:${contractId}`).emit('term_content_changed', {
        termId: termId,
        updates: updates,
        updatedBy: updatedBy,
        timestamp: new Date()
      });
      
      console.log(`Term ${termId} updated by ${updatedBy}`);
    });

    // Listen for full contract confirmation events
    socket.on('contract_confirmed', (data) => {
      const { contractId, confirmedBy } = data;
      
      contractIO.to(`contract:${contractId}`).emit('contract_status_changed', {
        status: 'confirmed',
        confirmedBy: confirmedBy,
        timestamp: new Date()
      });
      
      console.log(`Contract ${contractId} confirmed by ${confirmedBy}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from contract namespace');
    });
  });
};