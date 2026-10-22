import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const LanguageContext = createContext();

const translations = {
  el: {
    sidebar: {
      dashboard: 'Dashboard',
      companies: 'Επιχειρήσεις',
      occupants: 'Παρευρισκόμενοι',
      settings: 'Ρυθμίσεις',
      incidents: 'Συμβάντα & Ιστορικό',
      systemStatus: 'Κατάσταση συστήματος',
      operational: 'Λειτουργικό',
    },

    common: {
      backDashboard: '← Πίσω στο Dashboard',
      cancel: 'Ακύρωση',
      save: 'Αποθήκευση',
      add: 'Προσθήκη',
      edit: 'Επεξεργασία',
      delete: 'Διαγραφή',
      remove: 'Αφαίρεση',
      active: 'Ενεργός',
      inactive: 'Ανενεργή',
      loading: 'Φόρτωση δεδομένων...',
    },

    settings: {
      eyebrow: 'SETTINGS',
      title: 'Ρυθμίσεις',
      description:
        'Προσαρμόστε την εμφάνιση και τη γλώσσα της εφαρμογής.',
      appearance: 'Εμφάνιση',
      appearanceDescription:
        'Επιλέξτε το θέμα εμφάνισης της εφαρμογής.',
      darkMode: 'Σκούρο θέμα',
      darkModeDescription:
        'Αλλαγή από λευκό σε σκούρο θέμα.',
      language: 'Γλώσσα',
      languageDescription:
        'Επιλέξτε τη γλώσσα της εφαρμογής.',
      applicationLanguage: 'Γλώσσα εφαρμογής',
      languageDescriptionShort:
        'Επιλέξτε Ελληνικά ή English.',
      greek: 'Ελληνικά',
      english: 'English',
    },

    occupants: {
      eyebrow: 'OCCUPANT MANAGEMENT',
      title: 'Παρευρισκόμενοι',
      description:
        'Διαχειριστείτε τους παρευρισκόμενους ανά επιχείρηση.',
      companyOccupants: 'Παρευρισκόμενοι επιχείρησης',
      companyDescription:
        'Επιλέξτε επιχείρηση για να δείτε τους συνδεδεμένους χρήστες.',
      addOccupant: '+ Προσθήκη παρευρισκόμενου',
      company: 'Επιχείρηση',
      occupantsCount: 'παρευρισκόμενοι',
      noOccupants: 'Δεν υπάρχουν παρευρισκόμενοι',
      noOccupantsDescription:
        'Η συγκεκριμένη επιχείρηση δεν έχει ακόμη συνδεδεμένους χρήστες.',
      fullName: 'Ονοματεπώνυμο',
      username: 'Username',
      email: 'Email',
      role: 'Ρόλος',
      status: 'Κατάσταση',
      actions: 'Ενέργειες',
      employee: 'Employee',
      manager: 'Manager',
      security: 'Security',
      administrator: 'Administrator',

      address: 'Διεύθυνση',
      phone: 'Τηλέφωνο',
      email: 'Email',
      taxId: 'ΑΦΜ',

      president: 'Πρόεδρος',
      vicePresident: 'Αντιπρόεδρος',
      securityTeam: 'Ομάδα ασφαλείας',
      team: 'Ομάδα',
      securityPhone: 'Τηλέφωνο ασφαλείας',

      loading: 'Φόρτωση δεδομένων...',
      errorLoadingData:
        'Δεν ήταν δυνατή η φόρτωση των δεδομένων.',
      errorLoadingOccupants:
        'Δεν ήταν δυνατή η φόρτωση των παρευρισκόμενων.',
      errorAddingOccupant:
        'Δεν ήταν δυνατή η προσθήκη του παρευρισκόμενου.',
      errorUpdatingOccupant:
        'Δεν ήταν δυνατή η ενημέρωση του παρευρισκόμενου.',
      errorRemovingOccupant:
        'Δεν ήταν δυνατή η αφαίρεση του παρευρισκόμενου.',

      occupantsCount: 'παρευρισκόμενοι',
      noOccupants: 'Δεν υπάρχουν παρευρισκόμενοι',
      noOccupantsDescription:
        'Η συγκεκριμένη επιχείρηση δεν έχει ακόμη συνδεδεμένους χρήστες.',

      actions: 'Ενέργειες',
      status: 'Κατάσταση',
      activeStatus: 'Ενεργός',

      removeConfirmation:
        'Θέλετε να αφαιρέσετε τον',
      removeConfirmationEnd:
        'από την επιχείρηση;',

      newOccupant: 'NEW OCCUPANT',
      addOccupantTitle: 'Προσθήκη παρευρισκόμενου',
      addOccupantDescription:
        'Προσθέστε έναν χρήστη στην επιλεγμένη επιχείρηση.',
      user: 'Χρήστης',
      selectUser: 'Επιλέξτε χρήστη',
      role: 'Ρόλος',
      cancel: 'Ακύρωση',
      saving: 'Αποθήκευση...',
      addButton: 'Προσθήκη',

      editOccupant: 'EDIT OCCUPANT',
      editOccupantTitle: 'Επεξεργασία παρευρισκόμενου',
      editOccupantDescription:
        'Τροποποιήστε τον ρόλο του παρευρισκόμενου.',
      saveButton: 'Αποθήκευση',
    },

    companies: {
      title: 'Επιχειρήσεις',
      addCompany: '+ Νέα επιχείρηση',
      registeredCompanies:
        'Καταχωρημένες επιχειρήσεις',
    },

    companyManagement: {
      eyebrow: 'COMPANY MANAGEMENT',
      title: 'Επιχειρήσεις',
      description:
        'Διαχειριστείτε τα στοιχεία των επιχειρήσεων που εμφανίζονται στον πίνακα διαχείρισης.',
      registeredCompanies: 'Καταχωρημένες επιχειρήσεις',
      companiesCount: 'επιχειρήσεις',
      newCompany: 'Νέα επιχείρηση',
      editCompany: 'Επεξεργασία επιχείρησης',
      newCompanyEyebrow: 'NEW COMPANY',
      editCompanyEyebrow: 'EDIT COMPANY',

      basicInformation: 'Βασικά στοιχεία',
      companyName: 'Όνομα επιχείρησης',
      address: 'Διεύθυνση',
      floorCount: 'Αριθμός ορόφων',
      logoUrl: 'Logo URL',
      optional: 'Προαιρετικό',

      president: 'Πρόεδρος',
      vicePresident: 'Αντιπρόεδρος',
      fullName: 'Ονοματεπώνυμο',
      phone: 'Τηλέφωνο',
      email: 'Email',

      securityTeam: 'Ομάδα ασφαλείας',
      securityTeamPhone: 'Τηλέφωνο ομάδας ασφαλείας',

      floors: 'Όροφοι',
      occupants: 'Παρευρισκόμενοι',

      edit: 'Επεξεργασία',
      delete: 'Διαγραφή',
      saveChanges: 'Αποθήκευση αλλαγών',
      createCompany: 'Δημιουργία επιχείρησης',
      cancel: 'Ακύρωση',

      noAddress: 'Δεν έχει οριστεί διεύθυνση',

      deleteConfirmation:
        'Θέλετε σίγουρα να διαγράψετε αυτή την επιχείρηση;',
      loadError:
        'Αδυναμία φόρτωσης των επιχειρήσεων.',
      placeholderCompanyName:
        'π.χ. TALOS Industries',
      placeholderAddress:
        'π.χ. Λεωφόρος Κηφισίας 120, Αθήνα',
      placeholderSecurityTeam:
        'π.χ. 5 άτομα',
    },

    dashboard: {
      eyebrow: 'OVERVIEW',
      title: 'Πίνακας διαχείρισης',
      description:
        'Διαχειριστείτε τις επιχειρήσεις, τους ορόφους και τις προσομοιώσεις εκκένωσης.',
      companies: 'Επιχειρήσεις',
      registeredCompanies:
        'καταχωρημένες επιχειρήσεις',
      floors: 'Όροφοι',
      occupants: 'Παρευρισκόμενοι',
      active: 'Ενεργή',
      inactive: 'Ανενεργή',
      openCompany: 'Άνοιγμα επιχείρησης',
    },

    incidents: {
      title: 'Συμβάντα & Ιστορικό',
    },
  },

  en: {
    sidebar: {
      dashboard: 'Dashboard',
      companies: 'Companies',
      occupants: 'Occupants',
      settings: 'Settings',
      incidents: 'Incidents & History',
      systemStatus: 'System status',
      operational: 'Operational',
    },

    common: {
      backDashboard: '← Back to Dashboard',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      remove: 'Remove',
      active: 'Active',
      inactive: 'Inactive',
      loading: 'Loading data...',
    },

    settings: {
      eyebrow: 'SETTINGS',
      title: 'Settings',
      description:
        'Customize the appearance and language of the application.',
      appearance: 'Appearance',
      appearanceDescription:
        'Choose the appearance theme of the application.',
      darkMode: 'Dark theme',
      darkModeDescription:
        'Switch from light to dark theme.',
      language: 'Language',
      languageDescription:
        'Choose the application language.',
      applicationLanguage: 'Application language',
      languageDescriptionShort:
        'Choose Greek or English.',
      greek: 'Ελληνικά',
      english: 'English',
    },

    occupants: {
      eyebrow: 'OCCUPANT MANAGEMENT',
      title: 'Occupants',
      description:
        'Manage occupants by company.',
      companyOccupants: 'Company occupants',
      companyDescription:
        'Select a company to view connected users.',
      addOccupant: '+ Add occupant',
      company: 'Company',
      occupantsCount: 'occupants',
      noOccupants: 'No occupants',
      noOccupantsDescription:
        'This company does not have any connected users yet.',
      fullName: 'Full name',
      username: 'Username',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',
      employee: 'Employee',
      manager: 'Manager',
      security: 'Security',
      administrator: 'Administrator',

      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      taxId: 'Tax ID',

      president: 'President',
      vicePresident: 'Vice President',
      securityTeam: 'Security Team',
      team: 'Team',
      securityPhone: 'Security phone',

      loading: 'Loading data...',
      errorLoadingData:
        'The data could not be loaded.',
      errorLoadingOccupants:
        'The occupants could not be loaded.',
      errorAddingOccupant:
        'The occupant could not be added.',
      errorUpdatingOccupant:
        'The occupant could not be updated.',
      errorRemovingOccupant:
        'The occupant could not be removed.',

      occupantsCount: 'occupants',
      noOccupants: 'No occupants',
      noOccupantsDescription:
        'This company does not have any connected users yet.',

      actions: 'Actions',
      status: 'Status',
      activeStatus: 'Active',

      removeConfirmation:
        'Do you want to remove',
      removeConfirmationEnd:
        'from the company?',

      newOccupant: 'NEW OCCUPANT',
      addOccupantTitle: 'Add occupant',
      addOccupantDescription:
        'Add a user to the selected company.',
      user: 'User',
      selectUser: 'Select user',
      role: 'Role',
      cancel: 'Cancel',
      saving: 'Saving...',
      addButton: 'Add',

      editOccupant: 'EDIT OCCUPANT',
      editOccupantTitle: 'Edit occupant',
      editOccupantDescription:
        'Modify the occupant role.',
      saveButton: 'Save',
    },

    companies: {
      title: 'Companies',
      addCompany: '+ New company',
      registeredCompanies:
        'Registered companies',
    },

    companyManagement: {
      eyebrow: 'COMPANY MANAGEMENT',
      title: 'Companies',
      description:
        'Manage the company information displayed on the management dashboard.',
      registeredCompanies: 'Registered companies',
      companiesCount: 'companies',
      newCompany: 'New company',
      editCompany: 'Edit company',
      newCompanyEyebrow: 'NEW COMPANY',
      editCompanyEyebrow: 'EDIT COMPANY',

      basicInformation: 'Basic information',
      companyName: 'Company name',
      address: 'Address',
      floorCount: 'Number of floors',
      logoUrl: 'Logo URL',
      optional: 'Optional',

      president: 'President',
      vicePresident: 'Vice President',
      fullName: 'Full name',
      phone: 'Phone',
      email: 'Email',

      securityTeam: 'Security team',
      securityTeamPhone: 'Security team phone',

      floors: 'Floors',
      occupants: 'Occupants',

      edit: 'Edit',
      delete: 'Delete',
      saveChanges: 'Save changes',
      createCompany: 'Create company',
      cancel: 'Cancel',

      noAddress: 'No address specified',

      deleteConfirmation:
        'Are you sure you want to delete this company?',
      loadError:
        'Unable to load companies.',
      placeholderCompanyName:
        'e.g. TALOS Industries',
      placeholderAddress:
        'e.g. 120 Kifisias Avenue, Athens',
      placeholderSecurityTeam:
        'e.g. 5 people',
    },

    dashboard: {
      eyebrow: 'OVERVIEW',
      title: 'Management Dashboard',
      description:
        'Manage companies, floors and evacuation simulations.',
      companies: 'Companies',
      registeredCompanies:
        'registered companies',
      floors: 'Floors',
      occupants: 'Occupants',
      active: 'Active',
      inactive: 'Inactive',
      openCompany: 'Open company',
    },

    incidents: {
      title: 'Incidents & History',
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem('talos-language') || 'el'
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('talos-theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem(
      'talos-language',
      language
    );
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (darkMode) {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');

      localStorage.setItem('talos-theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');

      localStorage.setItem('talos-theme', 'light');
    }
  }, [darkMode]);

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  function t(section, key) {
    return (
      translations[language]?.[section]?.[key] ??
      translations.el?.[section]?.[key] ??
      key
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
        darkMode,
        setDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}