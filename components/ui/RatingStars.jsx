import React, { useMemo, useState } from "react";

export default function RatingStars({
  value = 5,
  onChange,
  readOnly = false,
  size = 22,
  label,
}) {
  const v = Number(value) || 0;
  const [hover, setHover] = useState(0);
  const shown = useMemo(() => (hover ? hover : v), [hover, v]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {label ? (
        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
          {label}
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= shown;
            return (
              <button
                key={n}
                type="button"
                disabled={readOnly}
                onMouseEnter={() => !readOnly && setHover(n)}
                onMouseLeave={() => !readOnly && setHover(0)}
                onClick={() => !readOnly && onChange?.(n)}
                aria-label={`rating-${n}`}
                style={{
                  width: size + 8,
                  height: size + 8,
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: readOnly ? "default" : "pointer",
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  transition: "transform 120ms ease",
                  transform: !readOnly && hover === n ? "scale(1.06)" : "scale(1)",
                }}
              >
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  fill={active ? "#0F172A" : "none"}
                  stroke={active ? "#0F172A" : "#94A3B8"}
                  strokeWidth="1.6"
                >
                  <path d="M12 17.3l-6.18 3.73 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.76 1.64 7.03z" />
                </svg>
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#64748B",
            padding: "6px 10px",
            border: "1px solid rgba(15,23,42,0.10)",
            borderRadius: 999,
            background: "rgba(255,255,255,0.7)",
          }}
        >
          {shown}/5
        </div>
      </div>
    </div>
  );
}
