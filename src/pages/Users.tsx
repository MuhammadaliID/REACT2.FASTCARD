import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { userProfileApi } from "../api/userProfile.api";
import { apiError } from "../api/error";
import { toImageUrl } from "../api/image";
import { isAdmin } from "../auth/token";
import type { Role, UserProfile } from "../api/types";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import "./Users.css";

const PAGE_SIZE = 10;

function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [items, setItems] = useState<UserProfile[] | null>(null);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [listError, setListError] = useState("");
  const [retry, setRetry] = useState(0);

  const [searchDraft, setSearchDraft] = useState(search);
  const [notice, setNotice] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesError, setRolesError] = useState("");

  const [confirmItem, setConfirmItem] = useState<UserProfile | null>(null);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const admin = isAdmin();

  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setSearchDraft(search);
  }

  useEffect(() => {
    if (!admin) return;
    userProfileApi
      .getUserRoles()
      .then((res) => setRoles(res.data.data ?? []))
      .catch((err) => setRolesError(apiError(err, "Failed to load roles")));
  }, [admin]);

  useEffect(() => {
    let cancelled = false;

    userProfileApi
      .getUserProfiles({
        UserName: search || undefined,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.data ?? []);
        setTotalRecord(res.data.totalRecord || 0);
        setTotalPage(Math.max(1, res.data.totalPage || 1));
        setListError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setItems(null);
          setListError(apiError(err, "Failed to load users"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, retry]);

  const applySearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("search", value);
    else next.delete("search");
    next.delete("page");
    setSearchParams(next);
  };

  const goToPage = (next: number) => {
    const value = Math.min(Math.max(1, next), totalPage);
    if (value === page) return;
    const params = new URLSearchParams(searchParams);
    if (value === 1) params.delete("page");
    else params.set("page", String(value));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 4000);
  };

  const addRole = async (userId: string, roleId: string) => {
    if (!roleId) return;
    setActionError("");
    setBusy(true);
    try {
      await userProfileApi.addRoleToUser(userId, roleId);
      setRetry((v) => v + 1);
      flash("Role assigned");
    } catch (err) {
      setActionError(apiError(err, "Failed to assign the role"));
    } finally {
      setBusy(false);
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    setActionError("");
    setBusy(true);
    try {
      await userProfileApi.removeRoleFromUser(userId, roleId);
      setRetry((v) => v + 1);
      flash("Role removed");
    } catch (err) {
      setActionError(apiError(err, "Failed to remove the role"));
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    if (!confirmItem) return;
    setBusy(true);
    try {
      await userProfileApi.deleteUser(confirmItem.userId);
      setConfirmItem(null);
      setActionError("");
      setRetry((v) => v + 1);
      flash("User deleted");
    } catch (err) {
      setActionError(apiError(err, "Failed to delete the user"));
    } finally {
      setBusy(false);
    }
  };

  const pages = Array.from({ length: totalPage }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPage || Math.abs(n - page) <= 1
  );

  return (
    <div className="users-page">
      <div className="page-head">
        <h1 className="page-title">Users</h1>
      </div>

      {notice && <div className="alert alert-success page-alert">{notice}</div>}
      {actionError && <div className="alert alert-error page-alert">{actionError}</div>}
      {!admin && (
        <div className="alert alert-info page-alert">
          You are signed in without the Admin role. Viewing is allowed, but
          role management and deletion are checked by the backend.
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              applySearch(searchDraft.trim());
            }}
          >
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Search by username or name..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </form>
          <span className="toolbar-meta">
            {items ? `${totalRecord} result${totalRecord === 1 ? "" : "s"}` : ""}
          </span>
        </div>

        {admin && rolesError && (
          <div className="toolbar">
            <span className="alert alert-error">{rolesError}</span>
          </div>
        )}

        {listError && (
          <div className="empty">
            <p>{listError}</p>
            <button
              className="btn btn-primary"
              onClick={() => setRetry((v) => v + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!listError && items === null && <div className="empty">Loading users…</div>}

        {!listError && items !== null && items.length === 0 && (
          <div className="empty">
            <p>{search ? `Nothing found for “${search}”.` : "No users yet."}</p>
          </div>
        )}

        {!listError && items !== null && items.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    {admin && <th className="actions-head">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => {
                    const assigned = user.userRoles ?? [];
                    const available = roles.filter(
                      (role) => !assigned.some((r) => r.id === role.id)
                    );
                    return (
                      <tr key={user.userId}>
                        <td>
                          <div className="cell-title">
                            <span className="user-avatar">
                              {user.image ? (
                                <img src={toImageUrl(user.image)} alt="" />
                              ) : (
                                (user.userName || "?").charAt(0).toUpperCase()
                              )}
                            </span>
                            <span>
                              <span className="cell-name">{user.userName}</span>
                              <span className="cell-sub">
                                {[user.firstName, user.lastName]
                                  .filter(Boolean)
                                  .join(" ") || "—"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>{user.email || "—"}</td>
                        <td>{user.phoneNumber || "—"}</td>
                        <td>
                          <div className="role-badges">
                            {assigned.length === 0 && (
                              <span className="cell-sub">No roles</span>
                            )}
                            {assigned.map((role) => (
                              <span className="badge badge-role" key={role.id}>
                                {role.name}
                                {admin && (
                                  <button
                                    type="button"
                                    className="role-x"
                                    onClick={() =>
                                      removeRole(user.userId, role.id)
                                    }
                                    aria-label={`Remove ${role.name}`}
                                  >
                                    <Icon name="close" size={11} />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                        {admin && (
                          <td>
                            <div className="actions-cell">
                              {available.length > 0 && (
                                <select
                                  className="select role-select"
                                  value=""
                                  disabled={busy}
                                  onChange={(e) =>
                                    addRole(user.userId, e.target.value)
                                  }
                                >
                                  <option value="">Assign role…</option>
                                  {available.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <button
                                className="icon-btn danger"
                                onClick={() => {
                                  setActionError("");
                                  setConfirmItem(user);
                                }}
                                title="Delete user"
                              >
                                <Icon name="trash" size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPage > 1 && (
              <div className="pagination">
                <div className="page-list">
                  <button
                    className="page-btn"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    <Icon name="chevronLeft" size={15} />
                  </button>
                  {pages.map((n, i) => (
                    <span key={n} className="page-list">
                      {i > 0 && n - pages[i - 1] > 1 && (
                        <span className="page-dots">…</span>
                      )}
                      <button
                        className={`page-btn${n === page ? " active" : ""}`}
                        onClick={() => goToPage(n)}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                  <button
                    className="page-btn"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPage}
                  >
                    <Icon name="chevronRight" size={15} />
                  </button>
                </div>
                <span className="toolbar-meta">{totalRecord} Results</span>
              </div>
            )}
          </>
        )}
      </div>

      {confirmItem && (
        <Modal
          small
          title="Delete user"
          onClose={() => setConfirmItem(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={removeUser}
                disabled={busy}
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </>
          }
        >
          {actionError && <div className="alert alert-error">{actionError}</div>}
          <p className="confirm-text">
            Delete user <strong>{confirmItem.userName}</strong>? This is
            performed by the backend and cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Users;
