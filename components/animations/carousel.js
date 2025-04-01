// import { motion } from 'framer-motion';

// const images = [
//   "/images/patrick.png",
//   "/images/derLord.webp",
//   "/images/patrick.png",
//   "/images/patrick.png",
// ];

// export default function Carousel() {

//     return (
//         <div className="relative w-full h-96 overflow-hidden">
//           <motion.div
//             className="flex"
//             animate={{ x: ['0%', '-100%'] }}
//             transition={{
//               repeat: Infinity,
//               repeatType: 'loop',
//               duration: 10,
//               ease: 'linear',
//             }}
//           >
//             {images.map((image, index) => (
//               <div key={index} className="w-full h-full flex-shrink-0">
//                 <img src={image} alt={`image ${index + 1}`} className="object-cover w-full h-full" />
//               </div>
//             ))}
//           </motion.div>
//         </div>
//       );
//     };
