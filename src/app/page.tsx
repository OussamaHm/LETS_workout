
"use client";

import Today from "@/components/Today";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { data } = useAppContext(); // We can get data here
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-1 gap-8">
             <Today isMounted={isMounted} />
        </div>
    </div>
  );
}
