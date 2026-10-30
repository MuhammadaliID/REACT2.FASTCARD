import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { brandApi } from "../api/brand.api";
import { categoryApi } from "../api/category.api";
import { productApi } from "../api/product.api";
import { toImageUrl } from "../api/image";
import type { Category, ProductListItem } from "../api/types";
import Icon from "../components/Icon";
import "./Dashboard.css";

interface DashboardData {
  products: ProductListItem[];
  totalProducts: number;
  categories: Category[];
  totalBrands: number;
}

const money = (value: number) => `$${(Number(value) || 0).toFixed(2)}`;

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      productApi.getProducts({ PageNumber: 1, PageSize: 1000 }),
      categoryApi.getCategories(),
      brandApi.getBrands({ PageNumber: 1, PageSize: 1000 }),
    ])
      .then(([productsRes, categoriesRes, brandsRes]) => {
        if (cancelled) return;
        setData({
          products: productsRes.data.data?.products ?? [],
          totalProducts: productsRes.data.totalRecord || 0,
          categories: categoriesRes.data.data ?? [],
          totalBrands: brandsRes.data.totalRecord ?? 0,
        });
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load dashboard data");
      });

    return () => {
      cancelled = true;
    };
  }, [retry]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "products",
        label: "Products",
        value: String(data.totalProducts),
        icon: "box",
        tint: "red",
      },
      {
        key: "categories",
        label: "Categories",
        value: String(data.categories.length),
        icon: "layers",
        tint: "orange",
      },
      {
        key: "brands",
        label: "Brands",
        value: String(data.totalBrands),
        icon: "palette",
        tint: "green",
      },
    ];
  }, [data]);

  const chartPoints = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const cat of data.categories) counts.set(cat.categoryName, 0);
    for (const p of data.products) {
      const name = p.categoryName || "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts, ([label, value]) => ({ label, value }))
      .filter((point) => point.value > 0 || data.categories.length <= 8)
      .slice(0, 12);
  }, [data]);

  const topProducts = useMemo(() => {
    if (!data) return [];
    return [...data.products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [data]);

  const latestProducts = useMemo(() => {
    if (!data) return [];
    return data.products.slice(0, 5);
  }, [data]);

  if (error) {
    return (
      <div className="card empty">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => setRetry((v) => v + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="card empty">Loading dashboard…</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-head">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stat-row">
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.key}>
            <span className={`stat-icon tint-${stat.tint}`}>
              <Icon name={stat.icon} size={22} />
            </span>
            <div className="stat-text">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card panel">
          <div className="panel-head">
            <h2>Products by Category</h2>
          </div>
          <LineChart points={chartPoints} />
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h2>Top Products</h2>
            <Link to="/products" className="see-all">
              See All <Icon name="chevronRight" size={14} />
            </Link>
          </div>
          <ul className="top-list">
            {topProducts.map((product) => (
              <li key={product.id}>
                <img
                  className="top-thumb"
                  src={toImageUrl(product.image)}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <div className="top-info">
                  <span className="top-name">{product.productName}</span>
                  <span className="top-cat">in {product.categoryName || "category"}</span>
                </div>
                <div className="top-num">
                  <strong>{product.quantity}</strong>
                  <span>in stock</span>
                </div>
              </li>
            ))}
            {topProducts.length === 0 && <li className="top-empty">No products yet</li>}
          </ul>
        </section>
      </div>

      <div className="dash-grid dash-grid-bottom">
        <section className="card panel">
          <div className="panel-head">
            <h2>Latest Products</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latestProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="cell-title">
                        <img
                          className="cell-thumb"
                          src={toImageUrl(product.image)}
                          alt=""
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.visibility =
                              "hidden";
                          }}
                        />
                        <span className="cell-name">{product.productName}</span>
                      </div>
                    </td>
                    <td>{product.categoryName || "—"}</td>
                    <td>{money(product.price)}</td>
                    <td>
                      <span
                        className={`badge ${product.quantity > 0 ? "badge-in" : "badge-out"}`}
                      >
                        {product.quantity > 0 ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      No products yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h2>Top Products by Units in Stock</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="cell-title">
                        <img
                          className="cell-thumb"
                          src={toImageUrl(product.image)}
                          alt=""
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.visibility =
                              "hidden";
                          }}
                        />
                        <span className="cell-name">{product.productName}</span>
                      </div>
                    </td>
                    <td>{money(product.price)}</td>
                    <td>
                      <strong className="units">{product.quantity}</strong>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty">
                      No products yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ChartPoint {
  label: string;
  value: number;
}

function LineChart({ points }: { points: ChartPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return <div className="chart-empty">No data to display</div>;
  }

  const width = 640;
  const height = 240;
  const padLeft = 38;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 34;

  const max = Math.max(...points.map((p) => p.value), 1);
  const yMax = Math.ceil(max / 5) * 5 || 5;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const xAt = (i: number) =>
    points.length === 1
      ? padLeft + innerW / 2
      : padLeft + (innerW * i) / (points.length - 1);
  const yAt = (v: number) => padTop + innerH - (innerH * v) / yMax;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.value)}`)
    .join(" ");

  const gridValues = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  const active = hover !== null ? points[hover] : null;
  const tipLeft =
    hover !== null ? (xAt(hover) / width) * 100 : 0;
  const tipTop =
    hover !== null ? (yAt(points[hover].value) / height) * 100 : 0;

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Products by category chart"
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={yAt(value)}
              y2={yAt(value)}
              stroke="#eef1f6"
              strokeWidth="1"
            />
            <text x={padLeft - 8} y={yAt(value) + 4} textAnchor="end" className="axis-y">
              {value}
            </text>
          </g>
        ))}

        <path
          d={path}
          fill="none"
          stroke="#4880ff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={hover === i ? 6 : 4}
              fill="#fff"
              stroke="#4880ff"
              strokeWidth="2.5"
            />
            <circle
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={16}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <text
              x={xAt(i)}
              y={height - 10}
              textAnchor="middle"
              className="axis-x"
            >
              {p.label.length > 9 ? `${p.label.slice(0, 8)}…` : p.label}
            </text>
          </g>
        ))}
      </svg>

      {active && (
        <div
          className="chart-tip"
          style={{ left: `${tipLeft}%`, top: `${tipTop}%` }}
        >
          <strong>
            {active.value} product{active.value === 1 ? "" : "s"}
          </strong>
          <span>{active.label}</span>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
