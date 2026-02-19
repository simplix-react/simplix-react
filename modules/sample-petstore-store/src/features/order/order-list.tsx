"use client";

import { useMemo } from "react";

import { List, useCrudList } from "@simplix-react/ui";

interface Order {
  id: string;
  name: string;
}

function useMockList(): { data: Order[] | undefined; isLoading: boolean; error: Error | null } {
  const data = useMemo<Order[]>(() => [], []);
  return { data, isLoading: false, error: null };
}

export function OrderList() {
  // TODO: Connect to domain package hooks
  const list = useCrudList<Order>(useMockList);

  return (
    <List>
      <List.Toolbar>
        <List.Search
          value={list.filters.search}
          onChange={list.filters.setSearch}
          placeholder="Search order..."
        />
        {/* TODO: Add New Order button */}
      </List.Toolbar>

      <List.Table
        data={list.data}
        sort={list.sort.field ? { field: list.sort.field, direction: list.sort.direction } : null}
        onSortChange={(s) => list.sort.setSort(s.field, s.direction)}
        selectedIndices={list.selection.selected}
        onSelectionChange={list.selection.toggle}
        onSelectAll={() => list.selection.toggleAll(list.data)}
      >
        <List.Column<Order>
          field="id"
          header="ID"
        />
        <List.Column<Order>
          field="name"
          header="Name"
        />
      </List.Table>

      <List.Pagination
        page={list.pagination.page}
        pageSize={list.pagination.pageSize}
        total={list.pagination.total}
        totalPages={list.pagination.totalPages}
        onPageChange={list.pagination.setPage}
        onPageSizeChange={list.pagination.setPageSize}
      />

      <List.Empty reason={list.emptyReason} />
    </List>
  );
}
