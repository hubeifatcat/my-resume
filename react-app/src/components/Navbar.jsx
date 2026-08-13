import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SITE } from "../config.js";
import { useAuth } from "../hooks/useAuth.jsx";

const links = [
  { to: "/", label: "首页" },
  { to: "/demo", label: "Demo" },
  { to: "/workbench", label: "工作台" },
  { to: "/resume", label: "简历" },
];

export default function Navbar() {
  const { user, setAuthOpen, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="site-nav" id="siteNav">
      <div className="container">
        <NavLink to="/" className="brand">
          <span className="mark">W</span>
          <span>{SITE.title}</span>
        </NavLink>
        <ul className={"nav-links" + (open ? " open" : "")} id="navLinks">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={isActive(link.to) ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {user ? (
            <div className="ma-user-menu">
              <span className="ma-user-name">{user.username}</span>
              <NavLink className="btn btn-outline btn-sm" to="/demo">历史</NavLink>
              <button className="btn btn-outline btn-sm" onClick={logout}>退出</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setAuthOpen(true)}>
              登录 / 注册
            </button>
          )}
          <button
            className={"nav-toggle" + (open ? " open" : "")}
            id="navToggle"
            aria-label="菜单"
            onClick={() => setOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
