import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div>
      <h1>AI Teacher</h1>
      <p className="mt-2">Learn with AI-powered answers from your course materials.</p>
      <nav className="flex gap-4 mt-4">
        <Link to="/login">Log in</Link>
        <Link to="/signup">Sign up</Link>
      </nav>
    </div>
  );
}
