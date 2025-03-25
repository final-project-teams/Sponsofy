// contractSocket.js
module.exports.setupContractSocket = (contractIo) => {
  // Create a namespace for contract-related events
   // Add a specific namespace for contracts

  contractIo.on('connection', (socket) => {
    console.log('User connected to contract namespace');
    
    // Join a room for a specific contract
    socket.on('join_contract_room', (contractId) => {
      socket.join(`contract:${contractId}`);
      console.log(`User joined contract room: ${contractId}`);
    });

    // Listen for term acceptance events
    socket.on('term_accepted', (data) => {
      const { contractId, termId, role, confirmationField, userId } = data;
      
      // Broadcast to all clients in the contract room
      contractIo.to(`contract:${contractId}`).emit('term_status_changed', {
        termId,
        acceptedBy: role,
        confirmationField,
        action: 'accepted',
        timestamp: new Date()
      });
      
      console.log(`Term ${termId} accepted by ${role} (User: ${userId}) in contract: ${contractId}`);
    });

    // Listen for term update events
    socket.on('term_updated', (data) => {
      // data should contain contractId, termId, updates, and updatedBy
      const { contractId, termId, updates, updatedBy } = data;
      
      // Changed contractIO to contractIo
      contractIo.to(`contract:${contractId}`).emit('term_content_changed', {
        termId: termId,
        updates: updates,
        updatedBy: updatedBy,
        timestamp: new Date()
      });
      
      console.log(`Term ${termId} updated by ${updatedBy} in contract: ${contractId}`);
    });

    // Listen for full contract confirmation events
    socket.on('contract_confirmed', (data) => {
      const { contractId, confirmedBy } = data;
      
      // Changed contractIO to contractIo
      contractIo.to(`contract:${contractId}`).emit('contract_status_changed', {
        status: 'confirmed',
        confirmedBy: confirmedBy,
        timestamp: new Date()
      });
      
      console.log(`Contract ${contractId} confirmed by ${confirmedBy}`);
    });
    socket.on('escrow_payment_confirmed', (data) => {
      const { contractId, confirmedBy, paymentId } = data;
      
      // Broadcast to all clients in the contract room
      contractIo.to(`contract:${contractId}`).emit('escrow_payment_confirmed', {
        status: 'escrow_held',
        confirmedBy,
        paymentId,
        timestamp: new Date()
      });
      
      console.log(`Escrow payment ${paymentId} confirmed by ${confirmedBy} in contract: ${contractId}`);
    });
    
    // Handle room leaving when user disconnects or leaves contract
    socket.on('leave_contract_room', (contractId) => {
      socket.leave(`contract:${contractId}`);
      console.log(`User left contract room: ${contractId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from contract namespace');
      socket.rooms.forEach(room => {
        if (room.startsWith('contract:')) {
          socket.leave(room);
        }
      });
    });
  });
};