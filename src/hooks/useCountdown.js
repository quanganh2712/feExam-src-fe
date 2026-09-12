import { useEffect, useState } from "react";

function useCountdown(initialSeconds, running = false) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    if (secondsLeft <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [running, secondsLeft]);

  return secondsLeft;
}

export default useCountdown;
