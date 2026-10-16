const API_BASE_URL = 'http://localhost:8080/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `API Error: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ================================
// FLOORS
// ================================

export async function getFloor(floorId) {
  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}`
  );

  return handleResponse(response);
}

export async function updateFloorCalibration(
  floorId,
  calibration
) {
  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}/calibration`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calibration),
    }
  );

  return handleResponse(response);
}

// ================================
// FLOOR ELEMENTS
// ================================

export async function getFloorElements(floorId) {
  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}/elements`
  );

  return handleResponse(response);
}

export async function createFloorElement(
  floorId,
  element
) {
  const { id, ...elementData } = element;

  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}/elements`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elementData),
    }
  );

  return handleResponse(response);
}

export async function updateFloorElement(
  elementId,
  element
) {
  const response = await fetch(
    `${API_BASE_URL}/elements/${elementId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(element),
    }
  );

  return handleResponse(response);
}

export async function deleteFloorElement(
  elementId
) {
  const response = await fetch(
    `${API_BASE_URL}/elements/${elementId}`,
    {
      method: 'DELETE',
    }
  );

  return handleResponse(response);
}

// ================================
// ROUTE CONNECTIONS
// ================================

export async function getRouteConnections(
  floorId
) {
  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}/route-connections`
  );

  return handleResponse(response);
}

export async function createRouteConnection(
  floorId,
  connection
) {
  const response = await fetch(
    `${API_BASE_URL}/floors/${floorId}/route-connections`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connection),
    }
  );

  return handleResponse(response);
}

export async function updateRouteConnection(
  connectionId,
  connection
) {
  const response = await fetch(
    `${API_BASE_URL}/route-connections/${connectionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connection),
    }
  );

  return handleResponse(response);
}

export async function deleteRouteConnection(
  connectionId
) {
  const response = await fetch(
    `${API_BASE_URL}/route-connections/${connectionId}`,
    {
      method: 'DELETE',
    }
  );

  return handleResponse(response);
}