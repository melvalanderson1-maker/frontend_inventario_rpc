import { Outlet } from "react-router-dom";
import MenuAdmin from "../Administrador/MenuAdmin";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <MenuAdmin />
        <main className={`main-content ${open ? "menu-open" : ""}`}>
        <Outlet />
        </main>

    </div>
  );
}
