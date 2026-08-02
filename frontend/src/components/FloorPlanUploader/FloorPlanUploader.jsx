import './FloorPlanUploader.css';

function FloorPlanUploader({ onImageSelect, hasImage }) {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg'];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Επιτρέπονται μόνο εικόνες PNG, JPG ή JPEG.');
      event.target.value = '';
      return;
    }

    const maximumFileSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      alert('Η εικόνα δεν μπορεί να ξεπερνά τα 5 MB.');
      event.target.value = '';
      return;
    }

    onImageSelect(selectedFile);
  };

  return (
    <section className="floor-plan-uploader">
      <div>
        <p className="floor-plan-uploader-label">FLOOR PLAN IMAGE</p>

        <h3>
          {hasImage ? 'Αλλαγή κάτοψης' : 'Ανέβασμα κάτοψης'}
        </h3>

        <p>
          Επιλέξτε μια εικόνα PNG ή JPG. Η εικόνα θα χρησιμοποιηθεί ως
          υπόβαθρο για τα Floor Elements.
        </p>
      </div>

      <label className="floor-plan-upload-button">
        <span aria-hidden="true">↑</span>

        {hasImage ? 'Επιλογή άλλης εικόνας' : 'Επιλογή εικόνας'}

        <input
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={handleFileChange}
        />
      </label>
    </section>
  );
}

export default FloorPlanUploader;