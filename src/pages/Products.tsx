import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { brandApi } from "../api/brand.api";
import { colorApi } from "../api/color.api";
import { categoryApi } from "../api/category.api";
import { subCategoryApi } from "../api/subCategory.api";
import { productApi } from "../api/product.api";
import { apiError } from "../api/error";
import { toImageUrl } from "../api/image";
import { isAdmin } from "../auth/token";
import type {
  Brand,
  Category,
  Color,
  ProductDetail,
  ProductListItem,
  SubCategory,
} from "../api/types";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import "./Products.css";

const PAGE_SIZE = 10;

interface ProductForm {
  productName: string;
  description: string;
  code: string;
  weight: string;
  size: string;
  quantity: string;
  price: string;
  hasDiscount: boolean;
  discountPrice: string;
  brandId: string;
  colorId: string;
  categoryId: string;
  subCategoryId: string;
  images: File[];
}

const emptyForm: ProductForm = {
  productName: "",
  description: "",
  code: "",
  weight: "",
  size: "",
  quantity: "1",
  price: "",
  hasDiscount: false,
  discountPrice: "",
  brandId: "",
  colorId: "",
  categoryId: "",
  subCategoryId: "",
  images: [],
};

interface Meta {
  brands: Brand[];
  colors: Color[];
  categories: Category[];
  subs: SubCategory[];
}

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; productId: number }
  | null;

const money = (value: number) => `$${(Number(value) || 0).toFixed(2)}`;

const loadMeta = async (): Promise<Meta> => {
  const [brands, colors, categories, subs] = await Promise.all([
    brandApi.getBrands({ PageNumber: 1, PageSize: 1000 }),
    colorApi.getColors({ PageNumber: 1, PageSize: 1000 }),
    categoryApi.getCategories(),
    subCategoryApi.getSubCategories(),
  ]);
  return {
    brands: brands.data.data ?? [],
    colors: colors.data.data ?? [],
    categories: categories.data.data ?? [],
    subs: subs.data.data ?? [],
  };
};

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [items, setItems] = useState<ProductListItem[] | null>(null);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [listError, setListError] = useState("");
  const [retry, setRetry] = useState(0);

  const [searchDraft, setSearchDraft] = useState(search);

  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setSearchDraft(search);
  }

  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const [confirmItem, setConfirmItem] = useState<ProductListItem | null>(null);
  const [notice, setNotice] = useState("");

  const admin = isAdmin();

  useEffect(() => {
    let cancelled = false;

    productApi
      .getProducts({
        ProductName: search || undefined,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setItems(data?.products ?? []);
        setTotalRecord(res.data.totalRecord || 0);
        setTotalPage(Math.max(1, res.data.totalPage || 1));
        setListError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setItems(null);
          setListError(apiError(err, "Failed to load products"));
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

  const openAdd = async () => {
    setForm(emptyForm);
    setDetail(null);
    setFormError("");
    setModal({ mode: "add" });
    setMeta(null);
    try {
      setMeta(await loadMeta());
    } catch (err) {
      setFormError(apiError(err, "Failed to load form data"));
    }
  };

  const openEdit = async (productId: number) => {
    setForm(emptyForm);
    setDetail(null);
    setFormError("");
    setModal({ mode: "edit", productId });
    setMeta(null);
    setDetailLoading(true);
    try {
      const [metaResult, detailRes] = await Promise.all([
        loadMeta(),
        productApi.getProductById(productId),
      ]);
      setMeta(metaResult);
      const d = detailRes.data.data;
      setDetail(d);

      const brand = metaResult.brands.find(
        (b) => b.brandName.trim().toLowerCase() === (d.brand ?? "").trim().toLowerCase()
      );
      const color = metaResult.colors.find(
        (c) => c.colorName.trim().toLowerCase() === (d.color ?? "").trim().toLowerCase()
      );
      const sub = metaResult.subs.find((s) => s.id === d.subCategoryId);

      setForm({
        productName: d.productName ?? "",
        description: (d as ProductDetail & { description?: string }).description ?? "",
        code: d.code ?? "",
        weight: d.weight ?? "",
        size: d.size ?? "",
        quantity: String(d.quantity ?? 0),
        price: String(d.price ?? ""),
        hasDiscount: Boolean(d.hasDiscount),
        discountPrice: d.discountPrice ? String(d.discountPrice) : "",
        brandId: brand ? String(brand.id) : "",
        colorId: color ? String(color.id) : "",
        categoryId: sub?.categoryId != null ? String(sub.categoryId) : "",
        subCategoryId: d.subCategoryId ? String(d.subCategoryId) : "",
        images: [],
      });
    } catch (err) {
      setFormError(apiError(err, "Failed to load the product"));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setFormError("");
    setDetail(null);
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submitForm = async () => {
    setFormError("");

    if (!form.productName.trim()) return setFormError("Product name is required");
    if (!form.description.trim()) return setFormError("Description is required");
    if (!form.code.trim()) return setFormError("Code is required");
    if (!form.brandId) return setFormError("Brand is required");
    if (!form.colorId) return setFormError("Color is required");
    if (!form.subCategoryId) return setFormError("Sub category is required");
    if (!form.price.trim() || Number(form.price) < 0)
      return setFormError("Valid price is required");
    if (!form.quantity.trim() || Number(form.quantity) < 0)
      return setFormError("Valid quantity is required");
    if (modal?.mode === "add" && form.images.length === 0) {
      return setFormError("At least one image is required");
    }

    setBusy(true);
    try {
      if (modal?.mode === "add") {
        await productApi.addProduct({
          Images: form.images,
          BrandId: Number(form.brandId),
          ColorId: Number(form.colorId),
          ProductName: form.productName.trim(),
          Description: form.description.trim(),
          Quantity: Number(form.quantity),
          Weight: form.weight.trim() || undefined,
          Size: form.size.trim() || undefined,
          Code: form.code.trim(),
          Price: Number(form.price),
          HasDiscount: form.hasDiscount,
          DiscountPrice: form.hasDiscount ? Number(form.discountPrice || 0) : 0,
          SubCategoryId: Number(form.subCategoryId),
        });
        setNotice("Product created");
      } else if (modal?.mode === "edit") {
        await productApi.updateProduct({
          Id: modal.productId,
          BrandId: Number(form.brandId),
          ColorId: Number(form.colorId),
          ProductName: form.productName.trim(),
          Description: form.description.trim(),
          Quantity: Number(form.quantity),
          Weight: form.weight.trim() || undefined,
          Size: form.size.trim() || undefined,
          Code: form.code.trim(),
          Price: Number(form.price),
          HasDiscount: form.hasDiscount,
          DiscountPrice: form.hasDiscount ? Number(form.discountPrice || 0) : 0,
          SubCategoryId: Number(form.subCategoryId),
        });
        if (form.images.length > 0) {
          await productApi.addImageToProduct(modal.productId, form.images);
        }
        setNotice("Product updated");
      }
      closeModal();
      setRetry((v) => v + 1);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setFormError(apiError(err, "Failed to save the product"));
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirmItem) return;
    setBusy(true);
    try {
      await productApi.deleteProduct(confirmItem.id);
      setConfirmItem(null);
      setNotice("Product deleted");
      setRetry((v) => v + 1);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setFormError(apiError(err, "Failed to delete the product"));
    } finally {
      setBusy(false);
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(files)],
    }));
  };

  const removeNewImage = (index: number) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const removeExistingImage = async (imageId: number) => {
    if (!detail) return;
    try {
      await productApi.deleteImageFromProduct(imageId);
      const res = await productApi.getProductById(detail.id);
      setDetail(res.data.data);
    } catch (err) {
      setFormError(apiError(err, "Failed to delete the image"));
    }
  };

  const visibleSubs = meta
    ? meta.subs.filter(
        (sub) =>
          !form.categoryId ||
          sub.categoryId == null ||
          String(sub.categoryId) === form.categoryId
      )
    : [];

  const pages = Array.from({ length: totalPage }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPage || Math.abs(n - page) <= 1
  );

  return (
    <div className="products-page">
      <div className="page-head">
        <h1 className="page-title">Products</h1>
        {admin && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Icon name="plus" size={16} />
            Add product
          </button>
        )}
      </div>

      {notice && <div className="alert alert-success page-alert">{notice}</div>}

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
              placeholder="Search products..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </form>
          <span className="toolbar-meta">
            {items ? `${totalRecord} result${totalRecord === 1 ? "" : "s"}` : ""}
          </span>
        </div>

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

        {!listError && items === null && (
          <div className="empty">Loading products…</div>
        )}

        {!listError && items !== null && items.length === 0 && (
          <div className="empty">
            <p>{search ? `Nothing found for “${search}”.` : "No products yet."}</p>
            {admin && !search && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Icon name="plus" size={16} />
                Add product
              </button>
            )}
          </div>
        )}

        {!listError && items !== null && items.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="actions-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const discounted =
                      product.hasDiscount && product.discountPrice > 0;
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="cell-title">
                            <img
                              className="cell-thumb"
                              src={toImageUrl(product.image)}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <span>
                              <span className="cell-name">{product.productName}</span>
                              <span className="cell-sub">
                                {product.color} · #{product.id}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>{product.categoryName || "—"}</td>
                        <td>
                          {discounted ? (
                            <span className="price-stack">
                              <strong>{money(product.discountPrice)}</strong>
                              <s className="cell-sub">{money(product.price)}</s>
                            </span>
                          ) : (
                            <strong>{money(product.price)}</strong>
                          )}
                        </td>
                        <td>{product.quantity}</td>
                        <td>
                          <span
                            className={`badge ${
                              product.quantity > 0 ? "badge-in" : "badge-out"
                            }`}
                          >
                            {product.quantity > 0 ? "In stock" : "Out of stock"}
                          </span>
                        </td>
                        <td>
                          {admin && (
                            <div className="actions-cell">
                              <button
                                className="icon-btn"
                                onClick={() => openEdit(product.id)}
                                title="Edit product"
                              >
                                <Icon name="edit" size={16} />
                              </button>
                              <button
                                className="icon-btn danger"
                                onClick={() => setConfirmItem(product)}
                                title="Delete product"
                              >
                                <Icon name="trash" size={16} />
                              </button>
                            </div>
                          )}
                        </td>
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
                <span className="toolbar-meta">
                  {totalRecord} Results
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === "add" ? "Add product" : "Edit product"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitForm}
                disabled={busy || detailLoading || !meta}
              >
                {busy
                  ? "Saving…"
                  : modal.mode === "add"
                    ? "Create product"
                    : "Save changes"}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}

          {!meta && !formError && <div className="empty">Loading form data…</div>}

          {detailLoading && <div className="empty">Loading product…</div>}

          {meta && !detailLoading && (
            <div className="form-grid">
              <div className="field span-2">
                <label>Product name</label>
                <input
                  className="input"
                  value={form.productName}
                  onChange={(e) => setField("productName", e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="field span-2">
                <label>Description</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="field">
                <label>Brand</label>
                <select
                  className="select"
                  value={form.brandId}
                  onChange={(e) => setField("brandId", e.target.value)}
                >
                  <option value="">Select brand</option>
                  {meta.brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Color</label>
                <select
                  className="select"
                  value={form.colorId}
                  onChange={(e) => setField("colorId", e.target.value)}
                >
                  <option value="">Select color</option>
                  {meta.colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.colorName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  className="select"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                      subCategoryId: "",
                    }))
                  }
                >
                  <option value="">All categories</option>
                  {meta.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Sub category</label>
                <select
                  className="select"
                  value={form.subCategoryId}
                  onChange={(e) => setField("subCategoryId", e.target.value)}
                >
                  <option value="">Select sub category</option>
                  {visibleSubs.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subCategoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Code</label>
                <input
                  className="input"
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Quantity</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Price ($)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Weight</label>
                <input
                  className="input"
                  value={form.weight}
                  onChange={(e) => setField("weight", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Size</label>
                <input
                  className="input"
                  value={form.size}
                  onChange={(e) => setField("size", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Discount</label>
                <label className="checkbox-row discount-row">
                  <input
                    type="checkbox"
                    checked={form.hasDiscount}
                    onChange={(e) => setField("hasDiscount", e.target.checked)}
                  />
                  Has discount
                </label>
              </div>

              {form.hasDiscount && (
                <div className="field">
                  <label>Discount price ($)</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => setField("discountPrice", e.target.value)}
                  />
                </div>
              )}

              <div className="field span-2">
                <label>
                  {modal.mode === "add"
                    ? "Images (at least one, required)"
                    : "Add images"}
                </label>
                <input
                  className="input file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />

                <div className="image-previews">
                  {detail?.images?.map((image) => (
                    <div className="preview" key={`old-${image.id}`}>
                      <img src={toImageUrl(image.images)} alt="" />
                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => removeExistingImage(image.id)}
                        aria-label="Remove image"
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  ))}
                  {form.images.map((file, index) => (
                    <div className="preview" key={`${file.name}-${index}`}>
                      <img src={URL.createObjectURL(file)} alt="" />
                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => removeNewImage(index)}
                        aria-label="Remove image"
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {confirmItem && (
        <Modal
          small
          title="Delete product"
          onClose={() => setConfirmItem(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteProduct} disabled={busy}>
                {busy ? "Deleting…" : "Delete"}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <p className="confirm-text">
            Delete <strong>{confirmItem.productName}</strong>? The product will be
            removed from the shop catalog as well (both use the same backend).
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Products;
