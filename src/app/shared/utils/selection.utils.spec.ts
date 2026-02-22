import { SelectionManager, Selectable } from './selection.utils';

interface TestItem extends Selectable {
  id: string;
  name: string;
}

describe('SelectionManager', () => {
  let manager: SelectionManager<TestItem>;
  const items: TestItem[] = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
  ];

  beforeEach(() => {
    manager = new SelectionManager<TestItem>();
    manager.setItems(items);
  });

  it('should start with no selection', () => {
    expect(manager.selectedCount()).toBe(0);
    expect(manager.hasSelection()).toBe(false);
    expect(manager.allSelected()).toBe(false);
  });

  it('should toggle selection', () => {
    manager.toggle('1');
    expect(manager.isSelected('1')).toBe(true);
    expect(manager.selectedCount()).toBe(1);

    manager.toggle('1');
    expect(manager.isSelected('1')).toBe(false);
    expect(manager.selectedCount()).toBe(0);
  });

  it('should select and deselect', () => {
    manager.select('2');
    expect(manager.isSelected('2')).toBe(true);

    manager.deselect('2');
    expect(manager.isSelected('2')).toBe(false);
  });

  it('should select all items', () => {
    manager.selectAll();
    expect(manager.allSelected()).toBe(true);
    expect(manager.selectedCount()).toBe(3);
  });

  it('should clear selection', () => {
    manager.selectAll();
    manager.clear();
    expect(manager.selectedCount()).toBe(0);
    expect(manager.hasSelection()).toBe(false);
  });

  it('should toggle all on and off', () => {
    manager.toggleAll();
    expect(manager.allSelected()).toBe(true);

    manager.toggleAll();
    expect(manager.selectedCount()).toBe(0);
  });

  it('should return selected items', () => {
    manager.select('1');
    manager.select('3');
    const selected = manager.selectedItems();
    expect(selected).toHaveLength(2);
    expect(selected.map(i => i.id)).toContain('1');
    expect(selected.map(i => i.id)).toContain('3');
  });

  it('should get and set selected ids', () => {
    manager.setSelectedIds(['1', '2']);
    expect(manager.getSelectedIds()).toHaveLength(2);
    expect(manager.isSelected('1')).toBe(true);
    expect(manager.isSelected('2')).toBe(true);
    expect(manager.isSelected('3')).toBe(false);
  });

  it('should report hasSelection correctly', () => {
    expect(manager.hasSelection()).toBe(false);
    manager.select('1');
    expect(manager.hasSelection()).toBe(true);
  });
});
