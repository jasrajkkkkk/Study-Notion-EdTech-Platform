export default function RatingStars({ value = 0, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span>
      {stars.map((n) => (
        <span
          key={n}
          onClick={() => onChange && onChange(n)}
          style={{
            cursor: onChange ? "pointer" : "default",
            color: n <= Math.round(value) ? "#f59e0b" : "#d1d5db",
            fontSize: 18,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
