import { signal, computed } from '@angular/core';

export interface Selectable {
  id: string;
}

export class SelectionManager<T extends Selectable> {
  private itemsSignal = signal<T[]>([]);
  private selectedIdsSignal = signal<Set<string>>(new Set());

  readonly items = this.itemsSignal.asReadonly();
  readonly selectedIds = this.selectedIdsSignal.asReadonly();

  readonly selectedCount = computed(() => this.selectedIdsSignal().size);

  readonly allSelected = computed(() => {
    const items = this.itemsSignal();
    const selected = this.selectedIdsSignal();
    return items.length > 0 && items.every(item => selected.has(item.id));
  });

  readonly hasSelection = computed(() => this.selectedIdsSignal().size > 0);

  readonly selectedItems = computed(() => {
    const selected = this.selectedIdsSignal();
    return this.itemsSignal().filter(item => selected.has(item.id));
  });

  setItems(items: T[]): void {
    this.itemsSignal.set(items);
  }

  toggle(id: string): void {
    this.selectedIdsSignal.update(current => {
      const newSet = new Set(current);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIdsSignal.set(new Set());
    } else {
      const allIds = this.itemsSignal().map(item => item.id);
      this.selectedIdsSignal.set(new Set(allIds));
    }
  }

  select(id: string): void {
    this.selectedIdsSignal.update(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  }

  deselect(id: string): void {
    this.selectedIdsSignal.update(current => {
      const newSet = new Set(current);
      newSet.delete(id);
      return newSet;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIdsSignal().has(id);
  }

  clear(): void {
    this.selectedIdsSignal.set(new Set());
  }

  selectAll(): void {
    const allIds = this.itemsSignal().map(item => item.id);
    this.selectedIdsSignal.set(new Set(allIds));
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedIdsSignal());
  }

  setSelectedIds(ids: string[]): void {
    this.selectedIdsSignal.set(new Set(ids));
  }
}
