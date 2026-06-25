import { useEffect, useState } from "react";

const ORBIT_ENTERED_KEY = "home-orbit-entered";
const CABIN_ENTER_EVENT = "home-cabin-enter";

export default function OrbitReturn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.sessionStorage.getItem(ORBIT_ENTERED_KEY) === "true");

    const showReturn = () => setVisible(true);
    window.addEventListener(CABIN_ENTER_EVENT, showReturn);

    return () => {
      window.removeEventListener(CABIN_ENTER_EVENT, showReturn);
    };
  }, []);

  function returnHome() {
    window.sessionStorage.removeItem(ORBIT_ENTERED_KEY);
    window.location.href = "/";
  }

  if (!visible) return null;

  return (
    <button className="orbit-return" type="button" onClick={returnHome}>
      <span className="orbit-return__gate" aria-hidden="true"></span>
      <span className="orbit-return__label" aria-hidden="true">返航</span>
    </button>
  );
}
