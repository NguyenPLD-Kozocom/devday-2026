import { motion, AnimatePresence } from "framer-motion";
import honeyCellKo from "../assets/honey_cell_ko.png";
import honeyCellZo from "../assets/honey_cell_zo.png";
import honeyCellCom from "../assets/honey_cell_com.png";
import honeyCellCombo from "../assets/honey_cell_kozocom.png";

interface MergeAnimationProps {
  onComplete: () => void;
}

export function MergeAnimation({ onComplete }: MergeAnimationProps) {
  const parts = [
    { id: "ko", img: honeyCellKo, initialX: -300, initialY: 300 },
    { id: "zo", img: honeyCellZo, initialX: 0, initialY: 300 },
    { id: "com", img: honeyCellCom, initialX: 300, initialY: 300 },
  ];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {parts.map((part, index) => (
            <motion.div
              key={part.id}
              initial={{ x: part.initialX, y: part.initialY, scale: 0.5, rotateY: 180 }}
              animate={{ 
                x: [part.initialX, 0, 0], 
                y: [part.initialY, 0, 0], 
                scale: [0.5, 1.2, 1],
                rotateY: 0,
                opacity: [1, 1, 0, 0],
              }}
              transition={{ 
                duration: 2.5, 
                times: [0, 0.8, 0.9, 1],
                delay: index * 0.15,
                ease: "easeOut" 
              }}
              className="absolute w-[180px] h-[200px]"
            >
              <img src={part.img} alt={part.id} className="w-full h-full object-contain drop-shadow-2xl" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* The resulting merged tile */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0, 1], 
            scale: [0.8, 0.8, 1.5, 1],
          }}
          transition={{ 
            duration: 3.2, 
            times: [0, 0.6, 0.8, 1],
            ease: "easeInOut" 
          }}
          onAnimationComplete={onComplete}
          className="absolute z-10 w-[300px] h-[300px]"
        >
          {/* White flash effect during merge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 2, 2.5] 
            }}
            transition={{ duration: 1.2, delay: 2.0 }}
            className="absolute inset-0 bg-white rounded-full blur-3xl mix-blend-screen"
          />
          
          <img src={honeyCellCombo} alt="Kozocom" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
        </motion.div>
      </div>
    </div>
  );
}
