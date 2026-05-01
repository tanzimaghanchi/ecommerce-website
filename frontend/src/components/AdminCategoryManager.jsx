import React from "react";

const AdminCategoryManager = ({
  categories,
  renameForm,
  onSelectCategory,
  onRenameChange,
  onRenameSubmit,
}) => {
  return (
    <div className="timeline-card admin-panel-card">
      <div className="panel-header-row">
        <h2>Category manager</h2>
        <span className="category-pill">{categories.length} categories</span>
      </div>

      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Products</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.name}>
                <td>{category.name}</td>
                <td>{category.productCount}</td>
                <td>
                  <button
                    className="ghost-button admin-table-button"
                    type="button"
                    onClick={() => onSelectCategory(category.name)}
                  >
                    Rename
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-rename-card">
        <input
          className="form-control"
          name="currentName"
          placeholder="Current category"
          value={renameForm.currentName}
          onChange={onRenameChange}
        />
        <input
          className="form-control"
          name="nextName"
          placeholder="New category name"
          value={renameForm.nextName}
          onChange={onRenameChange}
        />
        <button className="primary-button" type="button" onClick={onRenameSubmit}>
          Update category
        </button>
      </div>
    </div>
  );
};

export default AdminCategoryManager;
