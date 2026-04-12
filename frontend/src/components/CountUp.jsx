import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function CountUp({ to, duration = 1.5, className = "", prefix = "", suffix = "" }) {
  const count = useMotionValue(0);
  // Transform the motion value into a string with locale formatting
  const rounded = useTransform(count, (latest) => {
    return prefix + Math.round(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [count, to, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
