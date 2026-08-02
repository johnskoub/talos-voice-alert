import './FloorEditorToolbar.css';

const editorTools = [
  { id: 'SELECT', icon: '↖', label: 'Select' },
  { id: 'ZONE', icon: '▱', label: 'Zone' },
  { id: 'OCCUPANT', icon: '●', label: 'Occupant' },
  { id: 'EXIT', icon: '⇥', label: 'Exit' },
  { id: 'STAIR', icon: '≋', label: 'Stair' },
  { id: 'ELEVATOR', icon: '↕', label: 'Elevator' },
  { id: 'EXTINGUISHER', icon: 'E', label: 'Extinguisher' },
  { id: 'FIRE_POINT', icon: '▲', label: 'Fire Point' },
  { id: 'ASSEMBLY_POINT', icon: '◎', label: 'Assembly Point' },
  { id: 'DELETE', icon: '×', label: 'Delete' },
];

function FloorEditorToolbar({ activeTool, onToolChange }) {
  return (
    <aside className="floor-editor-toolbar">
      <div className="floor-editor-toolbar-header">
        <p>EDITOR TOOLS</p>
        <h3>Floor Elements</h3>
      </div>

      <div className="floor-editor-tool-list">
        {editorTools.map((tool) => (
          <button
            key={tool.id}
            className={`floor-editor-tool ${
              activeTool === tool.id
                ? 'floor-editor-tool--active'
                : ''
            }`}
            type="button"
            onClick={() => onToolChange(tool.id)}
          >
            <span aria-hidden="true">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default FloorEditorToolbar;