function createFloorPlanStorageKey(companyId, floorId) {
  return `talos-floor-plan-${companyId}-${floorId}`;
}

export function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Δεν ήταν δυνατή η ανάγνωση της εικόνας.'));
    };

    reader.readAsDataURL(file);
  });
}

export function saveFloorPlanToSession({
  companyId,
  floorId,
  imageDataUrl,
  imageName,
}) {
  const storageKey = createFloorPlanStorageKey(companyId, floorId);

  const floorPlanData = {
    imageDataUrl,
    imageName,
  };

  sessionStorage.setItem(storageKey, JSON.stringify(floorPlanData));
}

export function loadFloorPlanFromSession(companyId, floorId) {
  const storageKey = createFloorPlanStorageKey(companyId, floorId);
  const storedValue = sessionStorage.getItem(storageKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}