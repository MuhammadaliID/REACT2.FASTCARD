import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "../Icon";
import { clearToken, getTokenInfo } from "../../auth/token";
import "./AdminLayout.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/orders", label: "Orders", icon: "orders" },
  { to: "/products", label: "Products", icon: "tag" },
];

const otherItems = [
  { to: "/categories", label: "Categories", icon: "layers" },
  { to: "/users", label: "Users", icon: "users" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const info = getTokenInfo();

  const [menuOpen, setMenuOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${menuOpen ? " open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-mark" aria-hidden="true">
            <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
              <path
                d="M1 2h4l3.2 12.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.6L25.5 7H7"
                stroke="#F7A614"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="20.5" r="2.2" fill="#4880FF" />
              <circle cx="21" cy="20.5" r="2.2" fill="#F7A614" />
              <path
                d="M14 4h8"
                stroke="#4880FF"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="logo-word">fastkart</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            className="nav-item nav-group-toggle"
            onClick={() => setOtherOpen((v) => !v)}
          >
            <Icon name="folder" size={18} />
            <span>Other</span>
            <Icon
              name="chevronRight"
              size={16}
              className={`chev${otherOpen ? " open" : ""}`}
            />
          </button>

          {otherOpen && (
            <div className="nav-subgroup">
              {otherItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item nav-sub${isActive ? " active" : ""}`
                  }
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-foot">© fastkart admin</div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <button
            type="button"
            className="burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <form
            className="top-search"
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget)
                .get("q")
                ?.toString()
                .trim();
              navigate(
                value ? `/products?search=${encodeURIComponent(value)}` : "/products"
              );
            }}
          >
            <Icon name="search" size={17} />
            <input name="q" type="search" placeholder="Search..." autoComplete="off" />
          </form>

          <div className="topbar-right">
            <span className="bell" aria-hidden="true">
              <Icon name="bell" size={19} />
            </span>

            <div className="user-menu">
              <button
                type="button"
                className="user-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <span className="avatar">
                  {(info?.userName || "A").charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{info?.userName || "Admin"}</span>
                <Icon name="chevronDown" size={15} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-head">
                    <strong>{info?.userName || "Admin"}</strong>
                    <span>{info?.email}</span>
                    <span className="user-roles">
                      {(info?.roles ?? []).join(", ") || "No roles"}
                    </span>
                  </div>
                  <button type="button" className="dropdown-item" onClick={logout}>
                    <Icon name="logout" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
