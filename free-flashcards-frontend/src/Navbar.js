import { Link } from 'react-router-dom';

export default function Navbar() {
    return <nav className="nav">
        <ul>
            <li>
                <Link to="/" className="home-link">Home</Link>
            </li>
            <li>
                <Link to="/sets" className="create-set">Create New Study Set</Link>
            </li>
        </ul>
    </nav>
}