import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm";
import CategoryKeywordTable from "../../components/categories/CategoryKeywordTable";
import CategoryKeywordForm from "../../components/categories/CategoryKeywordForm";

import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "../../services/category.service";

import { getDepartments } from "../../services/department.service";

import {
  createKeyword,
  deactivateKeyword,
  getKeywordsByCategory,
  updateKeyword,
} from "../../services/category-keyword.service";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // PAGINATION STATE
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ============================================================
  // CATEGORY FORM STATE
  // ============================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ============================================================
  // CATEGORY DEACTIVATION STATE
  // ============================================================

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [categoryToDeactivate, setCategoryToDeactivate] = useState(null);

  // ============================================================
  // KEYWORD STATE
  // ============================================================

  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);
  const [selectedCategoryForKeywords, setSelectedCategoryForKeywords] =
    useState(null);

  const [keywords, setKeywords] = useState([]);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);

  const [isKeywordFormOpen, setIsKeywordFormOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [isKeywordSubmitting, setIsKeywordSubmitting] = useState(false);

  const [isKeywordDeactivateOpen, setIsKeywordDeactivateOpen] = useState(false);
  const [keywordToDeactivate, setKeywordToDeactivate] = useState(null);

  // ============================================================
  // INITIAL DATA
  // ============================================================

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [categoriesResponse, departmentsResponse] = await Promise.all([
          getCategories(),
          getDepartments(),
        ]);

        setCategories(categoriesResponse.data);

        const activeDepartments = departmentsResponse.data.filter(
          (department) => department.isActive,
        );

        setDepartments(activeDepartments);
      } catch (error) {
        setError(error.message || "Failed to load category data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // ============================================================
  // SEARCH / FILTER HANDLERS
  // ============================================================

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(event) {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  }

  // ============================================================
  // CATEGORY HANDLERS
  // ============================================================

  function handleAddCategory() {
    setSelectedCategory(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedCategory(null);
  }

  function handleEdit(category) {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }

  function handleDeactivate(category) {
    setCategoryToDeactivate(category);
    setIsDeactivateOpen(true);
  }

  function handleCloseDeactivate() {
    setIsDeactivateOpen(false);
    setCategoryToDeactivate(null);
  }

  async function handleSubmitCategory(categoryData) {
    try {
      setIsSubmitting(true);
      setError("");

      if (selectedCategory) {
        const response = await updateCategory(
          selectedCategory.id,
          categoryData,
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === selectedCategory.id ? response.data : category,
          ),
        );
      } else {
        const response = await createCategory(categoryData);

        setCategories((currentCategories) => [
          response.data,
          ...currentCategories,
        ]);
      }

      handleCloseForm();
    } catch (error) {
      setError(error.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!categoryToDeactivate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await deactivateCategory(categoryToDeactivate.id);

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === categoryToDeactivate.id ? response.data : category,
        ),
      );

      handleCloseDeactivate();
    } catch (error) {
      setError(error.message || "Failed to deactivate category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================
  // KEYWORD COUNT
  // ============================================================

  function syncActiveKeywordCount(categoryId, keywordList) {
    const activeKeywordCount = keywordList.filter(
      (keyword) => keyword.isActive,
    ).length;

    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              _count: {
                ...category._count,
                keywords: activeKeywordCount,
              },
            }
          : category,
      ),
    );

    setSelectedCategoryForKeywords((currentCategory) =>
      currentCategory?.id === categoryId
        ? {
            ...currentCategory,
            _count: {
              ...currentCategory._count,
              keywords: activeKeywordCount,
            },
          }
        : currentCategory,
    );
  }

  // ============================================================
  // KEYWORD HANDLERS
  // ============================================================

  async function handleManageKeywords(category) {
    try {
      setSelectedCategoryForKeywords(category);
      setIsKeywordsOpen(true);
      setIsKeywordsLoading(true);
      setError("");

      const response = await getKeywordsByCategory(category.id);

      const loadedKeywords = response.data ?? [];

      setKeywords(loadedKeywords);

      // The category table should show the number
      // of ACTIVE keywords, not total keywords.
      syncActiveKeywordCount(category.id, loadedKeywords);
    } catch (error) {
      setError(error.message || "Failed to load category keywords.");
      setKeywords([]);
    } finally {
      setIsKeywordsLoading(false);
    }
  }

  function handleCloseKeywords() {
    if (isKeywordSubmitting) {
      return;
    }

    setIsKeywordsOpen(false);
    setSelectedCategoryForKeywords(null);
    setKeywords([]);
    setSelectedKeyword(null);
    setIsKeywordFormOpen(false);
    setIsKeywordDeactivateOpen(false);
    setKeywordToDeactivate(null);
  }

  function handleAddKeyword() {
    setSelectedKeyword(null);
    setIsKeywordFormOpen(true);
  }

  function handleEditKeyword(keyword) {
    setSelectedKeyword(keyword);
    setIsKeywordFormOpen(true);
  }

  function handleCloseKeywordForm() {
    if (isKeywordSubmitting) {
      return;
    }

    setIsKeywordFormOpen(false);
    setSelectedKeyword(null);
  }

  async function handleSubmitKeyword(keywordData) {
    if (!selectedCategoryForKeywords) {
      return;
    }

    try {
      setIsKeywordSubmitting(true);
      setError("");

      let updatedKeywords;

      if (selectedKeyword) {
        const response = await updateKeyword(selectedKeyword.id, keywordData);

        updatedKeywords = keywords.map((keyword) =>
          keyword.id === selectedKeyword.id ? response.data : keyword,
        );
      } else {
        const response = await createKeyword(
          selectedCategoryForKeywords.id,
          keywordData.keyword,
          keywordData.weight,
        );

        updatedKeywords = [...keywords, response.data];
      }

      setKeywords(updatedKeywords);

      // Recalculate the active keyword count from the
      // actual keyword state instead of blindly adding 1.
      syncActiveKeywordCount(selectedCategoryForKeywords.id, updatedKeywords);

      handleCloseKeywordForm();
    } catch (error) {
      setError(error.message || "Failed to save keyword.");
    } finally {
      setIsKeywordSubmitting(false);
    }
  }

  function handleDeactivateKeyword(keyword) {
    setKeywordToDeactivate(keyword);
    setIsKeywordDeactivateOpen(true);
  }

  function handleCloseKeywordDeactivate() {
    if (isKeywordSubmitting) {
      return;
    }

    setIsKeywordDeactivateOpen(false);
    setKeywordToDeactivate(null);
  }

  async function handleConfirmDeactivateKeyword() {
    if (!keywordToDeactivate || !selectedCategoryForKeywords) {
      return;
    }

    try {
      setIsKeywordSubmitting(true);
      setError("");

      const response = await deactivateKeyword(keywordToDeactivate.id);

      const updatedKeywords = keywords.map((keyword) =>
        keyword.id === keywordToDeactivate.id ? response.data : keyword,
      );

      setKeywords(updatedKeywords);

      // Recalculate from the actual keyword state.
      syncActiveKeywordCount(selectedCategoryForKeywords.id, updatedKeywords);

      handleCloseKeywordDeactivate();
    } catch (error) {
      setError(error.message || "Failed to deactivate keyword.");
    } finally {
      setIsKeywordSubmitting(false);
    }
  }

  async function handleActivateKeyword(keyword) {
    if (!selectedCategoryForKeywords) {
      return;
    }

    try {
      setIsKeywordSubmitting(true);
      setError("");

      const response = await updateKeyword(keyword.id, {
        isActive: true,
      });

      const updatedKeywords = keywords.map((currentKeyword) =>
        currentKeyword.id === keyword.id ? response.data : currentKeyword,
      );

      setKeywords(updatedKeywords);

      // Recalculate from the actual keyword state.
      syncActiveKeywordCount(selectedCategoryForKeywords.id, updatedKeywords);
    } catch (error) {
      setError(error.message || "Failed to activate keyword.");
    } finally {
      setIsKeywordSubmitting(false);
    }
  }

  // ============================================================
  // FILTERING + PAGINATION
  // ============================================================

  const filteredCategories = categories.filter((category) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      category.name.toLowerCase().includes(searchTerm) ||
      category.code.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm) ||
      category.department?.name?.toLowerCase().includes(searchTerm) ||
      category.department?.code?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize),
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const rangeStart =
    filteredCategories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredCategories.length);

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      <PageHeader
        title="Categories"
        description="Manage request categories and their department assignments."
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAddCategory}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add Category
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="category-search" className="sr-only">
            Search categories
          </label>

          <input
            id="category-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by category, code, department, or description..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="sm:w-44">
          <label htmlFor="category-status" className="sr-only">
            Filter by status
          </label>

          <select
            id="category-status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <section aria-label="Category list" className="mt-6">
        {isLoading ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
            Loading categories...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <CategoryTable
              categories={paginatedCategories}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
              onManageKeywords={handleManageKeywords}
            />

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {filteredCategories.length}
                </span>
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-text-muted">
                  Page{" "}
                  <span className="font-medium text-text">{currentPage}</span>{" "}
                  of <span className="font-medium text-text">{totalPages}</span>
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          CATEGORY FORM MODAL
          ======================================================== */}

      {isFormOpen && (
        <Modal
          title={selectedCategory ? "Edit Category" : "Add Category"}
          size="lg"
          onClose={handleCloseForm}
        >
          <CategoryForm
            key={selectedCategory?.id || "create"}
            category={selectedCategory}
            departments={departments}
            onSubmit={handleSubmitCategory}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {/* ========================================================
          CATEGORY DEACTIVATE MODAL
          ======================================================== */}

      {isDeactivateOpen && categoryToDeactivate && (
        <Modal
          title="Deactivate Category"
          size="sm"
          onClose={handleCloseDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {categoryToDeactivate.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The category will remain in the system, but it will no longer be
              available for new request classification.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseDeactivate}
                disabled={isSubmitting}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={isSubmitting}
                className="rounded-md bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          KEYWORDS MODAL
          ======================================================== */}

      {isKeywordsOpen && selectedCategoryForKeywords && (
        <Modal
          title={`Keywords — ${selectedCategoryForKeywords.name}`}
          size="xl"
          onClose={handleCloseKeywords}
        >
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Manage keywords used to classify requests for this category.
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-primary-light px-2 py-1 text-xs font-medium text-primary">
                    {selectedCategoryForKeywords.code}
                  </span>

                  {selectedCategoryForKeywords.department && (
                    <span className="text-xs text-text-muted">
                      {selectedCategoryForKeywords.department.name}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={isKeywordsLoading || isKeywordSubmitting}
                className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Keyword
              </button>
            </div>

            {isKeywordsLoading ? (
              <div className="mt-6 rounded-lg border border-border bg-surface-muted p-6 text-center">
                <p className="text-sm text-text-secondary">
                  Loading keywords...
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <CategoryKeywordTable
                  keywords={keywords}
                  onEdit={handleEditKeyword}
                  onDeactivate={handleDeactivateKeyword}
                  onActivate={handleActivateKeyword}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-border pt-5">
              <button
                type="button"
                onClick={handleCloseKeywords}
                disabled={isKeywordSubmitting}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          KEYWORD FORM MODAL
          ======================================================== */}

      {isKeywordFormOpen && selectedCategoryForKeywords && (
        <Modal
          title={selectedKeyword ? "Edit Keyword" : "Add Keyword"}
          size="md"
          onClose={handleCloseKeywordForm}
        >
          <CategoryKeywordForm
            key={selectedKeyword?.id || "create-keyword"}
            keyword={selectedKeyword}
            onSubmit={handleSubmitKeyword}
            onCancel={handleCloseKeywordForm}
            isSubmitting={isKeywordSubmitting}
          />
        </Modal>
      )}

      {/* ========================================================
          KEYWORD DEACTIVATE MODAL
          ======================================================== */}

      {isKeywordDeactivateOpen && keywordToDeactivate && (
        <Modal
          title="Deactivate Keyword"
          size="sm"
          onClose={handleCloseKeywordDeactivate}
        >
          <div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-text">
                {keywordToDeactivate.keyword}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-text-muted">
              The keyword will remain in the system but will no longer be active
              for request classification.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseKeywordDeactivate}
                disabled={isKeywordSubmitting}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivateKeyword}
                disabled={isKeywordSubmitting}
                className="rounded-md bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isKeywordSubmitting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default Categories;
