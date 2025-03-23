// src/components/Navbar/Navbar.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUsers, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './Navbar.module.css';

export default function Navbar({ user, setUser }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>Remodel Pro</span>
        <span className={styles.logoSubtitle}>Project Management</span>
      </div>
      
      <ul className={styles.navLinks}>
        <li>
          <Link to="/home/customers" className={styles.navLink}>
            <FontAwesomeIcon icon={faUsers} className={styles.navIcon} />
            <span>Customers</span>
          </Link>
        </li>
        <li>
          <Link to="/home/customer" className={styles.navLink}>
            <FontAwesomeIcon icon={faPlusCircle} className={styles.navIcon} />
            <span>New Project</span>
          </Link>
        </li>
        <li>
          <Link to="/logout" className={`${styles.navLink} ${styles.logoutLink}`}>
            <FontAwesomeIcon icon={faSignOutAlt} className={styles.navIcon} />
            <span>{user.name}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}