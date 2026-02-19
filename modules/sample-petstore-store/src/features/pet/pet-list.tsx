"use client";

import { useMemo } from "react";

import { List, useCrudList } from "@simplix-react/ui";

interface Pet {
  id: string;
  name: string;
}

function useMockList(): { data: Pet[] | undefined; isLoading: boolean; error: Error | null } {
  const data = useMemo<Pet[]>(() => [], []);
  return { data, isLoading: false, error: null };
}

export function PetList() {
  // TODO: Connect to domain package hooks
  const list = useCrudList<Pet>(useMockList);

  return (
    <List>
      <List.Toolbar>
        <List.Search
          value={list.filters.search}
          onChange={list.filters.setSearch}
          placeholder="Search pet..."
        />
        {/* TODO: Add New Pet button */}
      </List.Toolbar>

      <List.Table
        data={list.data}
        sort={list.sort.field ? { field: list.sort.field, direction: list.sort.direction } : null}
        onSortChange={(s) => list.sort.setSort(s.field, s.direction)}
        selectedIndices={list.selection.selected}
        onSelectionChange={list.selection.toggle}
        onSelectAll={() => list.selection.toggleAll(list.data)}
      >
        <List.Column<Pet>
          field="id"
          header="ID"
        />
        <List.Column<Pet>
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
