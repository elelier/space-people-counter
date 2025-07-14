"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [count, setCount] = useState(0);

  const handleButtonClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Button Test Page</h1>
      <div className="mb-4">Count: {count}</div>
      <div className="flex flex-col gap-4">
        <Button onClick={handleButtonClick}>
          Standard Button Click
        </Button>
        <Button onClick={() => setCount(count + 1)}>
          Inline Arrow Function Click
        </Button>
        <a
          href="#info"
          className="px-4 py-2 rounded-md bg-blue-600 text-white inline-block"
          onClick={(e) => {
            e.preventDefault();
            setCount(count + 1);
          }}
        >
          Link Button
        </a>
      </div>
    </div>
  );
}
