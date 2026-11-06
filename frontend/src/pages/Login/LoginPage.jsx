import { useState } from 'react';
import { useNavigate } from 'react-router';
import talosLogo from '../../assets/talos-logo.png';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import './LoginPage.css';


function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: '',
    }));

    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Το email είναι υποχρεωτικό.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Ο κωδικός είναι υποχρεωτικός.';
    }

    setErrors(newErrors);
    setMessage('');

    if (newErrors.email || newErrors.password) {
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.email,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const user = await response.json();

      localStorage.setItem(
        'talosUser',
        JSON.stringify(user)
      );

      navigate('/dashboard');

    } catch (error) {

      setMessage(
        'Λανθασμένο email ή κωδικός πρόσβασης.'
      );
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <img
            className="login-logo"
            src={talosLogo}
            alt="TALOS logo"
          />

          <p className="login-eyebrow">Emergency Management Platform</p>

          <h1>TALOS Evacuation Platform</h1>

          <p className="login-description">
            Διαχείριση επιχειρήσεων, κατόψεων και προσομοιώσεων
            εκκένωσης μέσα από ένα ενιαίο περιβάλλον ελέγχου.
          </p>

          <div className="login-feature-list">
            <div>
              <span>01</span>
              Διαχείριση πολλαπλών επιχειρήσεων
            </div>

            <div>
              <span>02</span>
              Διαδραστικές κατόψεις ορόφων
            </div>

            <div>
              <span>03</span>
              Οπτική και φωνητική καθοδήγηση
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-card-header">
            <p className="login-card-label">SECURE ACCESS</p>
            <h2>Σύνδεση διαχειριστή</h2>
            <p>
              Εισαγάγετε τα στοιχεία σας για πρόσβαση στην πλατφόρμα.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <FormInput
              id="email"
              label="Email"
              name="email"
              type="email"
              placeholder="admin@talos.com"
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
            />

            <FormInput
              id="password"
              label="Κωδικός πρόσβασης"
              name="password"
              type="password"
              placeholder="Εισαγάγετε τον κωδικό σας"
              value={formData.password}
              error={errors.password}
              onChange={handleChange}
            />

            <Button type="submit" variant="primary">
              SIGN IN
            </Button>

            {message && (
              <p className="login-message" role="status">
                {message}
              </p>
            )}
          </form>

          <footer className="login-card-footer">
            <span>TALOS Platform</span>
            <span>Version 1.0</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;