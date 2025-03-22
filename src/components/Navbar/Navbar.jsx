// src/components/Navbar/Navbar.jsx
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ user, setUser }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Remodel Pro</div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/home/customers" className={styles.navLink}>
            Customers
          </Link>
        </li>
        <li>
          <Link to="/home/customer" className={styles.navLink}>
            New Project
          </Link>
        </li>
        <li>
          <Link to="/logout" className={styles.navLink}>
            Log Out ({user.name})
          </Link>
        </li>
      </ul>
    </nav>
  );
}