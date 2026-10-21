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
    },

    companies: {
      title: 'Επιχειρήσεις',
      addCompany: '+ Νέα επιχείρηση',
      registeredCompanies:
        'Καταχωρημένες επιχειρήσεις',
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
    },

    companies: {
      title: 'Companies',
      addCompany: '+ New company',
      registeredCompanies:
        'Registered companies',
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

  useEffect(() => {
    localStorage.setItem(
      'talos-language',
      language
    );
  }, [language]);

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);
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
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}