import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createPersonInCharge, getPersonInCharge } from '../../api/personInChargeApi';
import Layout from '../../components/layout';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { PersonInCharge, PersonInChargeForm } from '../../models/PersonInCharge';
import logo from '../../assets/Logo.png';

import './personInCharge.css';

const initialFormState: PersonInChargeForm = {
  name: '',
  lastname: '',
  contact: '',
};

function PersonInChargePage() {
  const [people, setPeople] = useState<PersonInCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<PersonInChargeForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<PersonInChargeForm>>({});
  const itemsPerPage = 10;

  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(people, itemsPerPage);

  const loadPeople = async (signal?: AbortSignal) => {
    try {
      const response = await getPersonInCharge(signal);
      if (signal?.aborted) return;
      setPeople(Array.isArray(response) ? response : []);
    } catch (error) {
      if (signal?.aborted) return;
      console.error(error);
      toast.error('No se pudo cargar la lista de personas');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadPeople(controller.signal);
    return () => { controller.abort(); };
  }, []);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return 'El nombre solo puede contener letras';
        if (value.length > 50) return 'El nombre no puede exceder 50 caracteres';
        return null;

      case 'lastname':
        if (!value.trim()) return 'Los apellidos son requeridos';
        if (value.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return 'Los apellidos solo pueden contener letras';
        if (value.length > 100) return 'Los apellidos no pueden exceder 100 caracteres';
        return null;

      case 'contact':
        if (!value.trim()) return 'El contacto es requerido';
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 8) return 'El contacto debe tener al menos 8 dígitos';
        if (digitsOnly.length > 15) return 'El contacto no puede exceder 15 dígitos';
        if (!/^[\d+\-\s()]+$/.test(value)) return 'Formato de contacto inválido';
        return null;

      default:
        return null;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<PersonInChargeForm> = {};
    let isValid = true;

    (['name', 'lastname', 'contact'] as const).forEach(field => {
      const error = validateField(field, formData[field] || '');
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);
      const normalizedData: PersonInChargeForm = {
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        contact: formData.contact.replace(/\D/g, ''),
      };

      await createPersonInCharge(normalizedData);
      toast.success('Persona agregada correctamente');
      resetForm();
      setFormOpen(false);
      setCurrentPage(1);
      await loadPeople();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo crear la persona');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="people-page">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="people-page__background-logo"
        />

        <div className="people-page__header">
          <div>
            <p className="people-page__eyebrow">Personas a cargo</p>
            <h1>Listado de personas</h1>
          </div>

          <button
            type="button"
            className="people-page__new-btn"
            onClick={() => setFormOpen(open => !open)}
          >
            {formOpen ? 'Cerrar formulario' : '+ Agregar persona'}
          </button>
        </div>

        {formOpen && (
          <section className="people-form-card">
            <div className="people-form-card__header">
              <div>
                <h2>Agregar persona</h2>
                <p>Completa los datos para crear un nuevo registro.</p>
              </div>
            </div>

            <form className="people-form" onSubmit={handleSubmit}>
              <label>
                <span>Nombre</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {formErrors.name && (
                  <span className="people-form__error" id="name-error" role="alert">
                    {formErrors.name}
                  </span>
                )}
              </label>

              <label>
                <span>Apellidos</span>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder=" "
                  minLength={2}
                  maxLength={100}
                  pattern="^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$"
                  aria-invalid={!!formErrors.lastname}
                  aria-describedby={formErrors.lastname ? 'lastname-error' : undefined}
                />
                {formErrors.lastname && (
                  <span className="people-form__error" id="lastname-error" role="alert">
                    {formErrors.lastname}
                  </span>
                )}
              </label>

              <label>
                <span>Contacto</span>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder=" "
                  pattern="^[0-9+\-\s()]+$"
                  minLength={8}
                  maxLength={15}
                  aria-invalid={!!formErrors.contact}
                  aria-describedby={formErrors.contact ? 'contact-error' : undefined}
                />
                {formErrors.contact && (
                  <span className="people-form__error" id="contact-error" role="alert">
                    {formErrors.contact}
                  </span>
                )}
              </label>

              <div className="people-form__actions">
                <button
                  type="button"
                  className="people-form__secondary"
                  onClick={() => { resetForm(); setFormOpen(false); }}
                >
                  ✕ Cancelar
                </button>

                <button
                  type="submit"
                  className="people-form__primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner spinner--small" /> Guardando...
                    </>
                  ) : (
                    <>✓ Guardar persona</>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="people-table-card">
          <div className="people-table-card__header">
            <h2>Personas registradas</h2>
          </div>

          {loading ? (
            <p className="people-table-card__state">Cargando...</p>
          ) : people.length === 0 ? (
            <p className="people-table-card__state">No hay personas registradas.</p>
          ) : (
            <div className="people-table-wrapper">
              <table className="people-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(person => (
                    <tr key={person.id}>
                      <td>{person.name}</td>
                      <td>{person.lastname}</td>
                      <td>{person.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </Layout>
  );
}

export default PersonInChargePage;