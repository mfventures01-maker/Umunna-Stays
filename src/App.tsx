import React, { useEffect, useState } from "react";
import { loadAppData } from "./dataStore";

const App = () => {
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadAppData();
        setAppData(data);
      } catch (err) {
        console.error("App init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading Umunna Stays...
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Umunna Stays</h1>
      <p>{appData?.meta?.brand_name}</p>
      <p>{appData?.meta?.default_city}</p>
    </div>
  );
};

export default App;