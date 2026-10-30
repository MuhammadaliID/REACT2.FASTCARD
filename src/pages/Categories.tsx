import { useEffect, useState } from "react";
import { categoryApi } from "../api/category.api";
import { apiError } from "../api/error";
import { toImageUrl } from "../api/image";
import { isAdmin } from "../auth/token";
import type { Category } from "../api/types";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import "./Categories.css";

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; category: Category }
  | null;

const fileFromUrl = async (url: string): Promise<File | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const ext = blob.type.split("/")[1] || "png";
    return new File([blob], `category.${ext}`, { type: blob.type });
  } catch {
    return null;
  }
};

function Categories() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const [confirmItem, setConfirmItem] = useState<Category | null>(null);
  const [notice, setNotice] = useState("");

  const admin = isAdmin();

  useEffect(() => {
    let cancelled = false;

    categoryApi
      .getCategories()
      .then((res) => {
        if (!cancelled) {
          setItems(res.data.data ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setItems(null);
          setError(apiError(err, "Failed to load categories"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retry]);

  const openAdd = () => {
    setName("");
    setFile(null);
    setPreview("");
    setFormError("");
    setModal({ mode: "add" });
  };

  const openEdit = (category: Category) => {
    setName(category.categoryName);
    setFile(null);
    setPreview(toImageUrl(category.categoryImage));
    setFormError("");
    setModal({ mode: "edit", category });
  };

  const closeModal = () => {
    setModal(null);
    setFormError("");
  };

  const pickFile = (files: FileList | null) => {
    const picked = files?.[0] ?? null;
    setFile(picked);
    setPreview(picked ? URL.createObjectURL(picked) : "");
  };

  const submit = async () => {
    setFormError("");
    if (!name.trim()) return setFormError("Category name is required");

    setBusy(true);
    try {
      if (modal?.mode === "add") {
        if (!file) return setFormError("Category image is required");
        await categoryApi.addCategory({
          CategoryName: name.trim(),
          CategoryImage: file,
        });
        setNotice("Category created");
      } else if (modal?.mode === "edit") {
        let imageFile = file;
        if (!imageFile) {
          imageFile = await fileFromUrl(toImageUrl(modal.category.categoryImage));
        }
        if (!imageFile) {
          return setFormError(
            "The backend requires an image for every update — please select a category image."
          );
        }
        await categoryApi.updateCategory({
          Id: modal.category.id,
          CategoryName: name.trim(),
          CategoryImage: imageFile,
        });
        setNotice("Category updated");
      }
      closeModal();
      setRetry((v) => v + 1);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setFormError(apiError(err, "Failed to save the category"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirmItem) return;
    setBusy(true);
    try {
      await categoryApi.deleteCategory(confirmItem.id);
      setConfirmItem(null);
      setNotice("Category deleted");
      setRetry((v) => v + 1);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setFormError(apiError(err, "Failed to delete the category"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="categories-page">
      <div className="page-head">
        <h1 className="page-title">Categories</h1>
        {admin && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Icon name="plus" size={16} />
            Add category
          </button>
        )}
      </div>

      {notice && <div className="alert alert-success page-alert">{notice}</div>}

      <div className="card">
        {error && (
          <div className="empty">
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => setRetry((v) => v + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!error && items === null && <div className="empty">Loading categories…</div>}

        {!error && items !== null && items.length === 0 && (
          <div className="empty">
            <p>No categories yet.</p>
            {admin && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Icon name="plus" size={16} />
                Add category
              </button>
            )}
          </div>
        )}

        {!error && items !== null && items.length > 0 && (
          <div className="table-wrap">
            <table className="data-table categories-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Sub categories</th>
                  <th>Image</th>
                  <th className="actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="cell-title">
                        <img
                          className="cell-thumb"
                          src={toImageUrl(category.categoryImage)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                        />
                        <span className="cell-name">{category.categoryName}</span>
                      </div>
                    </td>
                    <td>{category.subCategories?.length ?? 0}</td>
                    <td className="cell-sub">{category.categoryImage || "—"}</td>
                    <td>
                      {admin && (
                        <div className="actions-cell">
                          <button
                            className="icon-btn"
                            onClick={() => openEdit(category)}
                            title="Edit category"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setConfirmItem(category)}
                            title="Delete category"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === "add" ? "Add category" : "Edit category"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={busy}
              >
                {busy
                  ? "Saving…"
                  : modal.mode === "add"
                    ? "Create category"
                    : "Save changes"}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}

          <div className="field">
            <label>Category name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="field">
            <label>
              {modal.mode === "add"
                ? "Category image (required)"
                : "Category image (pick a new one or keep the current)"}
            </label>
            <input
              className="input file-input"
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files)}
            />
            {preview && (
              <div className="cat-preview">
                <img src={preview} alt="" />
              </div>
            )}
          </div>
        </Modal>
      )}

      {confirmItem && (
        <Modal
          small
          title="Delete category"
          onClose={() => setConfirmItem(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={remove} disabled={busy}>
                {busy ? "Deleting…" : "Delete"}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <p className="confirm-text">
            Delete <strong>{confirmItem.categoryName}</strong>? The change will be
            visible in the shop catalog too.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Categories;
