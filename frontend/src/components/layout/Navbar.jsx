import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/login">Login</Link>
        </nav>
    );
}

export default Navbar;