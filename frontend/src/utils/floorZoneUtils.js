export function findContainingZone(element, elements) {
  if (!element || element.type === 'ZONE') {
    return null;
  }

  const zones = elements.filter(
    (currentElement) => currentElement.type === 'ZONE'
  );

  return (
    zones.find((zone) => {
      const zoneRight = zone.x + zone.width;
      const zoneBottom = zone.y + zone.height;

      return (
        element.x >= zone.x &&
        element.x <= zoneRight &&
        element.y >= zone.y &&
        element.y <= zoneBottom
      );
    }) ?? null
  );
}