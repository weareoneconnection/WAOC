import React, { useEffect, useRef } from "react";
import ProofCardCanvas from "../proof/ProofCardCanvas.jsx";

export default function ProofCardPreview({ proofData, onCanvasRef }) {
  const apiRef = useRef(null);

  useEffect(() => {
    // 把 canvas 的导出 API（forwardRef 暴露的对象）交给 FinishScreen
    if (apiRef.current && typeof onCanvasRef === "function") {
      onCanvasRef(apiRef.current);
    }
  }, [onCanvasRef]);

  return <ProofCardCanvas ref={apiRef} data={proofData} />;
}
