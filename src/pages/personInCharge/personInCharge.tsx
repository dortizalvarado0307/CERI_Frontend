import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { createPersonInCharge, getPersonInCharge } from '../../api/personInChargeApi';
import Layout from '../../components/layout';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<PersonInChargeForm>(initialFormState);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const response = await getPersonInCharge();
      setPeople(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar la lista de personas');
    } finally {
      setLoading(false);
    }
  };

  const totalPeople = useMemo(() => people.length, [people]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalPeople / itemsPerPage)),
    [totalPeople]
  );

  const paginatedPeople = useMemo(
    () => people.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [currentPage, people]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(current => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);

      await createPersonInCharge(formData);

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
                  placeholder="Nombre"
                  required
                />
              </label>

              <label>
                <span>Apellidos</span>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Apellidos"
                  required
                />
              </label>

              <label>
                <span>Contacto</span>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Contacto"
                  required
                />
              </label>

              <div className="people-form__actions">
                <button
                  type="button"
                  className="people-form__secondary"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="people-form__primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar persona'}
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
                  {paginatedPeople.map(person => (
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

          {!loading && totalPages > 1 && (
            <div className="people-table__pagination">
              <button
                type="button"
                className="people-table__page-btn"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <span className="people-table__page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                className="people-table__page-btn"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default PersonInChargePage;