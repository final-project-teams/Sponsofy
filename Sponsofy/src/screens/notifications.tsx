// import { useEffect, useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:4000");

// export default function Notifications() {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     socket.on("notification", (data) => {
//       setNotifications((prev) => [...prev, data.message]);
//     });

//     return () => socket.off("notification");
//   }, []);

//   return (
//     <div className="p-4 bg-gray-100">
//       <h2 className="text-xl font-bold">Notifications</h2>
//       <ul>
//         {notifications.map((note, index) => (
//           <li key={index} className="border-b p-2">{note}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
