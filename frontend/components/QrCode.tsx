import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";

export function QrCode({ text, size = 160, label }: { text: string; size?: number; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    toDataURL(text, { margin: 1, width: size })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [text, size]);

  if (!src) return <span className="skeleton" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img src={src} width={size} height={size} alt={label} />;
}
