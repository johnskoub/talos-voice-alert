function createFloorElementsStorageKey(companyId, floorId) {
  return `talos-floor-elements-${companyId}-${floorId}`;
}

export function loadFloorElements(companyId, floorId) {
  const storageKey = createFloorElementsStorageKey(companyId, floorId);
  const storedValue = sessionStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    sessionStorage.removeItem(storageKey);
    return [];
  }
}

export function saveFloorElements(companyId, floorId, elements) {
  const storageKey = createFloorElementsStorageKey(companyId, floorId);

  sessionStorage.setItem(storageKey, JSON.stringify(elements));
}