import "../assets/scss/badge.scss";

interface BadgeProps {
  text: string;
  className ?:string;
}

export default function Badge({ text, className }: BadgeProps) {
  return (
    <div className={`Badge ${className}`}>
      <div className="stick"></div>
      <div className="content">
        <svg
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4 C 4 6, 8 6, 6 4 L8 2 L2 2 Z"
            fill="black"
            stroke="black"
            strokeWidth="0.1"
          />
        </svg>
      </div>
      <div className="text">
        <span>{text}</span>
      </div>
    </div>
  );
}