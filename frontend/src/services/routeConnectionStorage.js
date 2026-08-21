function getStorageKey(companyId, floorId) {
  return `talos-route-connections-${companyId}-${floorId}`;
}

export function loadRouteConnections(
  companyId,
  floorId
) {
  const storageKey = getStorageKey(
    companyId,
    floorId
  );

  const storedConnections =
    window.localStorage.getItem(storageKey);

  if (!storedConnections) {
    return [];
  }

  try {
    const parsedConnections =
      JSON.parse(storedConnections);

    return Array.isArray(parsedConnections)
      ? parsedConnections
      : [];
  } catch (error) {
    console.error(
      'Failed to load route connections:',
      error
    );

    return [];
  }
}

export function saveRouteConnections(
  companyId,
  floorId,
  connections
) {
  const storageKey = getStorageKey(
    companyId,
    floorId
  );

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(connections)
  );
}