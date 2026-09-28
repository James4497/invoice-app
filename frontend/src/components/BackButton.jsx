import { useNavigate } from "react-router-dom";

function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1); // go back to wherever you came from
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors duration-150"
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}

export default BackButton;